import { createContext, useContext } from "react";

export const StoreContext = createContext(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export const emptyDraft = {
  step: "service",
  service_id: null,
  staff_id: null, // "any" or a barber id
  slot: null, // ISO start time
  customer: { first_name: "", last_name: "", email: "", phone: "" },
  agreed: false,
};
