"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Pick = { label: string; value: string };
export type Line = {
  key: string;
  serviceId: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
  maxQty?: number | null;
  game: string;
  gameSlug: string;
  cs: string | null;
  csName: string | null;
  picks: Pick[];
};
const capOf = (maxQty?: number | null) => Math.max(1, Math.min(99, maxQty ?? 99));
type Profile = { name: string; account: string; schedule: string };
type State = {
  lines: Line[];
  profile: Profile;
  add: (l: Omit<Line, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clearGame: (gameSlug: string) => void;
  setProfile: (p: Partial<Profile>) => void;
};

export const useCart = create<State>()(
  persist(
    (set) => ({
      lines: [],
      profile: { name: "", account: "", schedule: "" },
add: (l) =>
  set((s) => {
    const key = l.serviceId + "|" + JSON.stringify(l.picks);
    const maxQty = l.maxQty ?? null;
    const found = s.lines.find((x) => x.key === key);
    if (found) {
      const effectiveMax = maxQty ?? found.maxQty ?? null;
      return {
        lines: s.lines.map((x) =>
          x.key === key
            ? { ...x, maxQty: effectiveMax, qty: Math.min(capOf(effectiveMax), x.qty + l.qty) }
            : x
        ),
      };
    }
    return {
      lines: [...s.lines, { ...l, maxQty, key, qty: Math.min(capOf(maxQty), l.qty) }],
    };
  }),
      setQty: (key, qty) =>
  set((s) => ({
    lines: s.lines.map((x) =>
      x.key === key ? { ...x, qty: Math.max(1, Math.min(capOf(x.maxQty), qty)) } : x
    ),
  })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((x) => x.key !== key) })),
      clearGame: (gameSlug) => set((s) => ({ lines: s.lines.filter((x) => x.gameSlug !== gameSlug) })),
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
    }),
    { name: "mygvstore-cart" }
  )
);