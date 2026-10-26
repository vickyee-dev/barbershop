import { nextId } from "../lib/booking.js";

// Soft-delete only (is_active), like the original schema: history stays intact.
export function reducer(state, action) {
  const now = new Date().toISOString();
  switch (action.type) {
    case "COMMIT_BOOKING": {
      const { customer, appointment } = action.payload;
      const exists = state.customers.some((c) => c.id === customer.id);
      return {
        ...state,
        customers: exists
          ? state.customers.map((c) => (c.id === customer.id ? customer : c))
          : [...state.customers, customer],
        appointments: [...state.appointments, appointment],
      };
    }
    case "SET_APPOINTMENT_STATUS":
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.payload.id ? { ...a, status: action.payload.status, updated_at: now } : a
        ),
      };
    case "SAVE_SERVICE":
      return { ...state, services: upsert(state.services, action.payload, now) };
    case "SAVE_STAFF":
      return { ...state, staff: upsert(state.staff, action.payload, now) };
    case "TOGGLE_SERVICE":
      return { ...state, services: toggle(state.services, action.payload, now) };
    case "TOGGLE_STAFF":
      return { ...state, staff: toggle(state.staff, action.payload, now) };
    case "TOGGLE_CUSTOMER":
      return { ...state, customers: toggle(state.customers, action.payload, now) };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}

function upsert(list, item, now) {
  if (item.id == null) {
    return [...list, { ...item, id: nextId(list), created_at: now }];
  }
  return list.map((x) => (x.id === item.id ? { ...x, ...item, updated_at: now } : x));
}

function toggle(list, id, now) {
  return list.map((x) => (x.id === id ? { ...x, is_active: !x.is_active, updated_at: now } : x));
}
