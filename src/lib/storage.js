import { config } from "../config.js";
import { buildSeed } from "./seed.js";

const VERSION = 2;

export function loadData() {
  try {
    const raw = localStorage.getItem(config.storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === VERSION && parsed.data) return parsed.data;
    }
  } catch {
    // Corrupt or unavailable storage: fall through to fresh demo data.
  }
  return buildSeed();
}

export function saveData(data) {
  try {
    localStorage.setItem(config.storageKey, JSON.stringify({ version: VERSION, data }));
  } catch {
    // Private mode or quota exceeded: the app keeps working in memory.
  }
}

const ADMIN_KEY = "barbershop.admin";
export const readAdminSession = () => {
  try {
    return sessionStorage.getItem(ADMIN_KEY) === "1";
  } catch {
    return false;
  }
};
export const writeAdminSession = (on) => {
  try {
    if (on) sessionStorage.setItem(ADMIN_KEY, "1");
    else sessionStorage.removeItem(ADMIN_KEY);
  } catch {
    // ignore
  }
};
