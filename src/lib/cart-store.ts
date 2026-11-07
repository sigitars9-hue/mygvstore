"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = { id: string; slug: string; name: string; price: number; unit: string; qty: number };
type State = {
  items: CartItem[];
  add: (i: Omit<CartItem, "qty">, q: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<State>()(
  persist(
    (set) => ({
      items: [],
      add: (i, q) =>
        set((s) => {
          const f = s.items.find((x) => x.id === i.id);
          return { items: f ? s.items.map((x) => (x.id === i.id ? { ...x, qty: x.qty + q } : x)) : [...s.items, { ...i, qty: q }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "jokiku-cart" }
  )
);