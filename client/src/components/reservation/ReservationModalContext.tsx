import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface ReservationModalContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openReservation: () => void;
}

const ReservationModalContext = createContext<ReservationModalContextValue | null>(
  null
);

export function ReservationModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo<ReservationModalContextValue>(
    () => ({
      open,
      setOpen,
      openReservation: () => setOpen(true),
    }),
    [open]
  );

  return (
    <ReservationModalContext.Provider value={value}>
      {children}
    </ReservationModalContext.Provider>
  );
}

export function useReservationModal(): ReservationModalContextValue {
  const ctx = useContext(ReservationModalContext);
  if (!ctx) {
    throw new Error("useReservationModal must be used within ReservationModalProvider");
  }
  return ctx;
}