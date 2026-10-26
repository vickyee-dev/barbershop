import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { config } from "../config";
import { createBooking } from "../lib/booking";
import { buildSeed } from "../lib/seed";
import { loadData, readAdminSession, saveData, writeAdminSession } from "../lib/storage";
import { StoreContext, emptyDraft } from "./context";
import { reducer } from "./reducer";

export default function StoreProvider({ children }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadData);
  const [draft, setDraft] = useState(emptyDraft);
  const [isAdmin, setIsAdmin] = useState(readAdminSession);
  const [toasts, setToasts] = useState([]);

  useEffect(() => saveData(data), [data]);

  const toast = useCallback((message, tone = "ok") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const bookAppointment = useCallback(
    (input, options) => {
      const result = createBooking(data, input, new Date(), options);
      if (result.ok) dispatch({ type: "COMMIT_BOOKING", payload: result });
      return result;
    },
    [data]
  );

  const updateDraft = useCallback((patch) => setDraft((d) => ({ ...d, ...patch })), []);
  const updateCustomer = useCallback(
    (patch) => setDraft((d) => ({ ...d, customer: { ...d.customer, ...patch } })),
    []
  );
  const resetDraft = useCallback(() => setDraft(emptyDraft), []);

  const loginAdmin = useCallback((email, password) => {
    const ok =
      email.trim().toLowerCase() === config.admin.email && password === config.admin.password;
    if (ok) {
      writeAdminSession(true);
      setIsAdmin(true);
    }
    return ok;
  }, []);

  const logoutAdmin = useCallback(() => {
    writeAdminSession(false);
    setIsAdmin(false);
  }, []);

  const resetDemoData = useCallback(() => dispatch({ type: "RESET", payload: buildSeed() }), []);

  const value = useMemo(
    () => ({
      data,
      dispatch,
      draft,
      updateDraft,
      updateCustomer,
      resetDraft,
      bookAppointment,
      isAdmin,
      loginAdmin,
      logoutAdmin,
      resetDemoData,
      toast,
      toasts,
    }),
    [data, draft, updateDraft, updateCustomer, resetDraft, bookAppointment, isAdmin, loginAdmin, logoutAdmin, resetDemoData, toast, toasts]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
