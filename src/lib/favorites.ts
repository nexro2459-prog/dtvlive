import { useEffect, useState, useCallback } from "react";

const KEY = "dtv-favorites";

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavs(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: string[]) => {
    setFavs(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const toggle = useCallback(
    (id: string) => {
      persist(favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id]);
    },
    [favs],
  );

  const isFav = useCallback((id: string) => favs.includes(id), [favs]);

  return { favs, toggle, isFav };
}
