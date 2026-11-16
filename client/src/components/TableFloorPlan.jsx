import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Armchair, CalendarClock, Check, ClipboardList, Loader2, Plus, Trash2, Users, X } from "lucide-react";
import { api, extractApiError } from "../lib/api";

const STATUS_STYLES = {
  FREE: "bg-emerald-950/40 border-emerald-500/50 text-emerald-400",
  RESERVED: "bg-amber-950/40 border-amber-500/50 text-amber-400",
  OCCUPIED: "bg-rose-950/40 border-rose-500/50 text-rose-400",
};
const STATUS_LABELS = {
  FREE: "Free",
  RESERVED: "Reserved",
  OCCUPIED: "Occupied",
};
const STATUS_OPTIONS = ["FREE", "RESERVED", "OCCUPIED"];
const BUTTON_STYLE = "rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";
const ZONES = ["Panoramic Rooftop", "Indoor Lounge", "Standard Dining"];

async function fetchActiveWaiters() {
  const { data } = await api.get("/users");
  return data.users.filter((user) => user.role === "waiter" && user.isActive !== false);
}

export function TableFloorPlan({ role, user }) {
  const queryClient = useQueryClient();
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["floor-tables"],
    queryFn: async () => {
      const { data } = await api.get("/tables");
      return data.tables;
    },
    refetchInterval: 5000,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [myTablesOnly, setMyTablesOnly] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [actionError, setActionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isAdmin = role === "admin";
  const { data: waiters = [] } = useQuery({
    queryKey: ["active-floor-waiters"],
    queryFn: fetchActiveWaiters,
    enabled: isAdmin,
  });

  const refreshTables = () => queryClient.invalidateQueries({ queryKey: ["floor-tables"] });
  const waiterName = (waiter) => (typeof waiter === "string" ? waiter : waiter?.name);
  const selectedTable = tables.find((table) => table.id === selectedId);
  const activeOrders = selectedTable?.activeOrders ?? [];
  const manualItems = activeOrders.length ? [] : selectedTable?.orderItems ?? [];
  const hasActiveItems = activeOrders.length > 0 || manualItems.length > 0;

  useEffect(() => {
    if (!selectedId) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  const runAction = async (action, { closeOnSuccess = false } = {}) => {
    setActionError("");
    setIsSaving(true);
    try {
      await action();
      await refreshTables();
      if (closeOnSuccess) setSelectedId(null);
    } catch (err) {
      setActionError(extractApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = (tableId, status, options = {}) =>
    runAction(async () => {
      await api.patch(`/tables/${tableId}/status`, { status, createOrder: Boolean(options.createOrder) });
    });

  const handleAssignWaiter = (tableId, waiterId) =>
    runAction(async () => {
      const waiter = waiters.find(
        (candidate) => String(candidate._id) === waiterId || String(candidate.id) === waiterId
      );
      await api.patch(`/tables/${tableId}`, {
        assignedWaiterId: waiter ? waiter._id || waiter.id : null,
      });
    });

  const handleCapacityChange = (tableId, capacity) =>
    runAction(async () => {
      await api.patch(`/tables/${tableId}`, { capacity });
    });

  const handleZoneChange = (tableId, zone) =>
    runAction(async () => {
      await api.patch(`/tables/${tableId}`, { zone });
    });

  const addTable = () =>
    runAction(async () => {
      const tableNumber = Math.max(0, ...tables.map((table) => Number(table.tableNumber) || 0)) + 1;
      await api.post("/tables", { tableNumber, capacity: 4, zone: ZONES[2] });
    });

  const addOrderItem = (event) => {
    event.preventDefault();
    const item = newItem.trim();
    if (!item || !selectedTable) return;
    runAction(async () => {
      await api.patch(`/tables/${selectedTable.id}`, { addItem: item });
      setNewItem("");
    });
  };

  const clearTable = () => {
    if (!selectedTable) return;
    const confirmed = window.confirm(
      `Clear all active orders for Table ${selectedTable.tableNumber} and reset it to Free?`
    );
    if (!confirmed) return;
    runAction(
      async () => {
        await api.post(`/tables/${selectedTable.id}/clear`);
      },
      { closeOnSuccess: true }
    );
  };

  const visibleTables = tables.filter(
    (table) =>
      !myTablesOnly ||
      table.assignedWaiter?.id === user?.id ||
      waiterName(table.assignedWaiter) === user?.name
  );
  const statusCounts = tables.reduce(
    (counts, table) => ({ ...counts, [table.status]: counts[table.status] + 1 }),
    { FREE: 0, RESERVED: 0, OCCUPIED: 0 }
  );

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-night-900/80 p-5 backdrop-blur-xl sm:p-6" aria-label="Interactive table floor plan">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Floor overview</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-cream">Table floor plan</h2>
          <p className="mt-1 text-sm text-cream/50">Click a table to open its management pop-up.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((status) => (
            <span key={status} className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
              {STATUS_LABELS[status]} · {statusCounts[status]}
            </span>
          ))}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setMyTablesOnly((value) => !value)}
              aria-pressed={myTablesOnly}
              className={`${BUTTON_STYLE} ${myTablesOnly ? "border-gold-400/40 text-gold-300" : ""}`}
            >
              {myTablesOnly ? "My assigned tables" : "All tables"}
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={addTable}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-night-950 transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />Add table
            </button>
          )}
        </div>
      </div>

      {actionError && !selectedTable && (
        <p role="alert" className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/40 px-4 py-2.5 text-sm text-rose-300">
          {actionError}
        </p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleTables.map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => {
                setSelectedId(table.id);
                setNewItem("");
                setActionError("");
              }}
              className={`group rounded-2xl border bg-gradient-to-br from-white/[0.06] to-transparent p-4 text-left shadow-lg backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-gold-400/60 ${STATUS_STYLES[table.status] || STATUS_STYLES.FREE}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-70">Table</p>
                  <p className="mt-1 text-2xl font-semibold text-cream">{String(table.tableNumber).padStart(2, "0")}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-black/20 px-2.5 py-1 text-xs font-medium">
                  <Users className="h-3.5 w-3.5" />
                  {table.capacity} seats
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between gap-2">
                <span className="rounded-full border border-current/20 bg-black/20 px-2.5 py-1 text-xs font-semibold">{table.status}</span>
                <span className="truncate text-right text-xs text-cream/60">
                  {table.zone || ZONES[2]} · {waiterName(table.assignedWaiter) || "Unassigned"}
                </span>
              </div>
            </button>
          ))}
          {visibleTables.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-cream/50">
              No tables are assigned to you yet.
            </p>
          )}
        </div>
      )}

      {selectedTable && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedId(null);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="table-dialog-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-night-900 p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-cream/50">Table details</p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h3 id="table-dialog-title" className="font-display text-2xl font-semibold text-cream">
                    Table {selectedTable.tableNumber}
                  </h3>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[selectedTable.status]}`}>
                    {STATUS_LABELS[selectedTable.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-cream/50">
                  {selectedTable.zone || ZONES[2]} · {selectedTable.capacity} seats · {waiterName(selectedTable.assignedWaiter) || "Unassigned"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg p-2 text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
                aria-label="Close table details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionError && (
              <p role="alert" className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/40 px-4 py-2.5 text-sm text-rose-300">
                {actionError}
              </p>
            )}

            <div className="space-y-5">
              <label className="block text-sm text-cream/70">
                Table status
                <select
                  value={selectedTable.status}
                  onChange={(event) => handleStatusChange(selectedTable.id, event.target.value)}
                  disabled={isSaving}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-night-950 px-3 py-2.5 text-cream focus:border-gold-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cream/50">
                    <ClipboardList className="h-4 w-4" /> Active orders & requests
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-cream/60">
                    {activeOrders.length + manualItems.length}
                  </span>
                </div>

                {!hasActiveItems && !selectedTable.reservation && (
                  <p className="mt-3 text-sm text-cream/50">No active orders or requests for this table.</p>
                )}

                {activeOrders.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {activeOrders.map((order) => (
                      <li key={order.id || order.orderId} className="rounded-lg border border-white/5 bg-night-950/70 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-cream">
                              {order.quantity} × {order.dishName}
                            </p>
                            <p className="mt-0.5 text-xs text-cream/45">
                              Order {order.orderId}
                              {order.timestamp ? ` · ${order.timestamp}` : ""}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full border border-gold-400/30 bg-gold-400/10 px-2 py-0.5 text-xs font-medium text-gold-300">
                            {order.status}
                          </span>
                        </div>
                        {order.specialInstructions && (
                          <p className="mt-2 text-xs text-cream/60">{order.specialInstructions}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {manualItems.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-cream/70">
                    {manualItems.map((item, index) => (
                      <li key={`${item}-${index}`}>· {item}</li>
                    ))}
                  </ul>
                )}

                {selectedTable.reservation && (
                  <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300/80">
                      <CalendarClock className="h-3.5 w-3.5" /> Reservation request
                    </p>
                    <p className="mt-1 text-sm text-cream">
                      {selectedTable.reservation.name} · {selectedTable.reservation.guests} guests · {selectedTable.reservation.timeSlot}
                    </p>
                    {selectedTable.reservation.phone && (
                      <p className="mt-0.5 text-xs text-cream/50">{selectedTable.reservation.phone}</p>
                    )}
                  </div>
                )}
              </div>

              {selectedTable.status === "FREE" && (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTable.id, "OCCUPIED")}
                    disabled={isSaving}
                    className={BUTTON_STYLE}
                  >
                    Seat customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTable.id, "OCCUPIED", { createOrder: true })}
                    disabled={isSaving}
                    className="rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-night-950 transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Create new order
                  </button>
                </div>
              )}

              {selectedTable.status === "RESERVED" && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedTable.id, "OCCUPIED")}
                  disabled={isSaving}
                  className="rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-night-950 transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Check-in party
                </button>
              )}

              {selectedTable.status === "OCCUPIED" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-cream/70">
                    <span className="inline-flex items-center gap-1">
                      <Armchair className="h-4 w-4" />
                      {selectedTable.capacity} seats
                    </span>
                    <span className="text-cream/40">·</span>
                    <span>Order {selectedTable.currentOrderId || "not created"}</span>
                  </div>
                  <form onSubmit={addOrderItem} className="flex gap-2">
                    <input
                      aria-label="Add order item"
                      value={newItem}
                      onChange={(event) => setNewItem(event.target.value)}
                      placeholder="Add item to order"
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-night-950 px-3 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-400/50 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newItem.trim() || isSaving}
                      className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-white/15 disabled:opacity-40"
                    >
                      Add item
                    </button>
                  </form>
                </div>
              )}

              {isAdmin && (
                <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cream/50">Table settings</p>
                  <label className="block text-sm text-cream/70">
                    Seat capacity
                    <input
                      type="number"
                      min="1"
                      max="30"
                      defaultValue={selectedTable.capacity}
                      disabled={isSaving}
                      onBlur={(event) => {
                        const capacity = Math.max(1, Number(event.target.value) || 1);
                        if (capacity !== selectedTable.capacity) handleCapacityChange(selectedTable.id, capacity);
                      }}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-night-950 px-3 py-2.5 text-cream focus:border-gold-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </label>
                  <label className="block text-sm text-cream/70">
                    Dining zone
                    <select
                      value={selectedTable.zone || ZONES[2]}
                      onChange={(event) => handleZoneChange(selectedTable.id, event.target.value)}
                      disabled={isSaving}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-night-950 px-3 py-2.5 text-cream focus:border-gold-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {ZONES.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm text-cream/70">
                    Active waiter
                    <select
                      value={selectedTable.assignedWaiter?.id || ""}
                      onChange={(event) => handleAssignWaiter(selectedTable.id, event.target.value)}
                      disabled={isSaving}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-night-950 px-3 py-2.5 text-cream focus:border-gold-400/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Unassigned</option>
                      {waiters.map((waiter) => (
                        <option key={waiter._id || waiter.id} value={waiter._id || waiter.id}>
                          {waiter.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 p-4">
                <p className="text-sm font-medium text-rose-200">Clear table orders</p>
                <p className="mt-1 text-xs text-cream/50">
                  Archives every active order for this table, completes today&apos;s reservation, and resets the table to Free.
                </p>
                <button
                  type="button"
                  onClick={clearTable}
                  disabled={isSaving || (!hasActiveItems && !selectedTable.reservation && selectedTable.status === "FREE")}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Reset Table to Free
                </button>
              </div>

              {selectedTable.status === "OCCUPIED" && hasActiveItems && (
                <p className="flex items-center gap-2 text-xs text-cream/40">
                  <Check className="h-3.5 w-3.5" />
                  Clearing the table removes these orders from the live view.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
