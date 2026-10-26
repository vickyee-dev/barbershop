import { useSyncExternalStore } from "react";

// Tiny hash router: no dependency, works on any static host (no server rewrites).
const subscribe = (cb) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const snapshot = () => window.location.hash || "#/";

export function usePath() {
  const hash = useSyncExternalStore(subscribe, snapshot, () => "#/");
  return hash.slice(1).split("?")[0] || "/";
}

export const navigate = (to) => {
  window.location.hash = to;
};

// Landing-page sections can't use #anchors (the hash is the route), so scroll by id.
export function goToSection(id) {
  const scroll = () => document.getElementById(id)?.scrollIntoView({ block: "start" });
  const onHome = (window.location.hash || "#/").replace(/^#/, "").split("?")[0] === "/";
  if (onHome) scroll();
  else {
    navigate("/");
    setTimeout(scroll, 120);
  }
}
