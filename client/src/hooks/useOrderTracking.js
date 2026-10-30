import { useEffect, useState } from "react";
import { readOrder, subscribeToOrder } from "../lib/orderTracking";

export function useOrderTracking(orderId) {
  const [order, setOrder] = useState(() => readOrder(orderId));
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!orderId) return undefined;
    setOrder(readOrder(orderId));
    return subscribeToOrder(orderId, (record, meta) => {
      if (record) setOrder(record);
      setIsLive(Boolean(meta?.live));
    });
  }, [orderId]);

  return { order, isLive };
}
