import { api } from "./api";

const STORAGE_KEY = "skyfirst_orders";
const CHANNEL_NAME = "skyfirst-live-orders";
const EVENT_KEY = "skyfirst_live_order_event";
const POLL_INTERVAL = 6000;
const POLL_BACKOFF = 30000;
const MAX_FAST_FAILURES = 3;

export const ORDER_STAGES = [
  {
    id: "received",
    label: "Received",
    description: "Your order is confirmed and sitting with the floor team.",
    eta: "~20 min",
  },
  {
    id: "preparing",
    label: "Preparing in the Kitchen",
    description: "Our chefs are cooking and plating your order right now.",
    eta: "~10 min",
  },
  {
    id: "ready",
    label: "Ready for Table",
    description: "Plated and ready — your waiter is bringing it over.",
    eta: "Ready now",
  },
];

export const ORDER_STAGE_IDS = ORDER_STAGES.map((stage) => stage.id);

const STATUS_ALIASES = {
  pending: "received",
  new: "received",
  placed: "received",
  confirmed: "received",
  accepted: "received",
  received: "received",
  preparing: "preparing",
  "in progress": "preparing",
  "in-progress": "preparing",
  in_kitchen: "preparing",
  cooking: "preparing",
  read: "preparing",
  ready: "ready",
  "ready for table": "ready",
  "ready-for-table": "ready",
  ready_for_table: "ready",
  replied: "ready",
  served: "ready",
  completed: "ready",
  done: "ready",
};

export function normalizeOrderStatus(status) {
  if (!status) return "received";
  const key = String(status).trim().toLowerCase();
  if (STATUS_ALIASES[key]) return STATUS_ALIASES[key];
  return ORDER_STAGE_IDS.includes(key) ? key : "received";
}

export function stageIndexOf(status) {
  const index = ORDER_STAGE_IDS.indexOf(normalizeOrderStatus(status));
  return index === -1 ? 0 : index;
}

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Storage can be blocked (private mode); the tracker still works for this session.
  }
}

function toRecord(order) {
  const now = new Date().toISOString();
  return {
    ...order,
    orderId: String(order.orderId),
    status: normalizeOrderStatus(order.status),
    placedAt: order.placedAt ?? now,
    updatedAt: order.updatedAt ?? now,
  };
}

function mergeRecord(record) {
  const orders = readAll();
  const existing = orders[record.orderId];
  if (existing && Date.parse(existing.updatedAt ?? 0) > Date.parse(record.updatedAt ?? 0)) {
    return existing;
  }
  orders[record.orderId] = record;
  writeAll(orders);
  return record;
}

let channel;
function getChannel() {
  if (channel !== undefined) return channel;
  try {
    channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;
  } catch {
    channel = null;
  }
  return channel;
}

function publish(record) {
  const activeChannel = getChannel();
  if (activeChannel) {
    activeChannel.postMessage({ type: "order-status", order: record });
    return;
  }
  try {
    localStorage.setItem(EVENT_KEY, JSON.stringify({ order: record, at: Date.now() }));
  } catch {
    // Nothing to broadcast to when storage is unavailable.
  }
}

export function saveOrder(order) {
  const record = toRecord(order);
  const orders = readAll();
  orders[record.orderId] = record;
  writeAll(orders);
  publish(record);
  return record;
}

export function readOrder(orderId) {
  if (!orderId) return null;
  return readAll()[String(orderId)] ?? null;
}

/**
 * Pushes a new kitchen stage. Staff dashboards use this; it broadcasts to every
 * listener in the browser immediately and mirrors the change to the API so
 * customers on other devices pick it up through polling.
 */
export async function updateOrderStatus(orderId, nextStatus) {
  const status = normalizeOrderStatus(nextStatus);
  const existing = readOrder(orderId);
  const record = {
    ...(existing ?? { orderId: String(orderId) }),
    orderId: String(orderId),
    status,
    placedAt: existing?.placedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orders = readAll();
  orders[record.orderId] = record;
  writeAll(orders);
  publish(record);

  try {
    await api.patch(`/orders/${encodeURIComponent(record.orderId)}/status`, { status });
    return { order: record, synced: true };
  } catch {
    return { order: record, synced: false };
  }
}

/**
 * Subscribes to one order. Updates arrive from three sources: same-browser
 * broadcasts (instant), storage events (fallback), and API polling (other
 * devices). `meta.live` reports whether the last sync succeeded.
 */
export function subscribeToOrder(orderId, onUpdate) {
  if (!orderId) return () => {};

  const applyIncoming = (incoming) => {
    if (!incoming || String(incoming.orderId) !== String(orderId)) return;
    const current = readOrder(orderId);
    const merged = mergeRecord(toRecord({ ...(current ?? {}), ...incoming }));
    onUpdate(merged, { live: true });
  };

  const activeChannel = getChannel();
  const onChannelMessage = (event) => applyIncoming(event.data?.order);
  if (activeChannel) activeChannel.addEventListener("message", onChannelMessage);

  const onStorage = (event) => {
    if (event.key !== EVENT_KEY || !event.newValue) return;
    try {
      applyIncoming(JSON.parse(event.newValue).order);
    } catch {
      // Ignore malformed cross-tab payloads.
    }
  };
  window.addEventListener("storage", onStorage);

  let timer;
  let cancelled = false;
  let failures = 0;
  let lastLive = null;

  const poll = async () => {
    let delay = POLL_INTERVAL;
    try {
      const { data } = await api.get(`/orders/${encodeURIComponent(orderId)}`);
      if (cancelled) return;
      failures = 0;
      const remote = data?.order ?? data ?? {};
      const current = readOrder(orderId);
      const remoteStatus = normalizeOrderStatus(remote.status ?? current?.status);

      if (!current) {
        const created = toRecord({
          ...remote,
          orderId,
          status: remoteStatus,
          placedAt: remote.placedAt ?? remote.createdAt ?? new Date().toISOString(),
        });
        onUpdate(mergeRecord(created), { live: true });
      } else if (current.status !== remoteStatus) {
        onUpdate(
          mergeRecord({ ...current, status: remoteStatus, updatedAt: new Date().toISOString() }),
          { live: true }
        );
      } else if (lastLive !== true) {
        onUpdate(current, { live: true });
      }
      lastLive = true;
    } catch {
      if (cancelled) return;
      failures += 1;
      delay = failures >= MAX_FAST_FAILURES ? POLL_BACKOFF : POLL_INTERVAL;
      if (lastLive !== false) {
        lastLive = false;
        const current = readOrder(orderId);
        if (current) onUpdate(current, { live: false });
      }
    }
    if (!cancelled) timer = setTimeout(poll, delay);
  };

  poll();

  return () => {
    cancelled = true;
    clearTimeout(timer);
    window.removeEventListener("storage", onStorage);
    if (activeChannel) activeChannel.removeEventListener("message", onChannelMessage);
  };
}
