import { createContext, useContext, useMemo, useState } from "react";
const ReservationModalContext = createContext(null);
export function ReservationModalProvider({ children }) {
    const [open, setOpen] = useState(false);
    const value = useMemo(() => ({
        open,
        setOpen,
        openReservation: () => setOpen(true),
    }), [open]);
    return (<ReservationModalContext.Provider value={value}>
      {children}
    </ReservationModalContext.Provider>);
}
export function useReservationModal() {
    const ctx = useContext(ReservationModalContext);
    if (!ctx) {
        throw new Error("useReservationModal must be used within ReservationModalProvider");
    }
    return ctx;
}
