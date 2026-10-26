import { useEffect, useState } from "react";

// A clock that re-renders its consumer every minute, so "past" time slots
// disappear while a page is left open.
export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
