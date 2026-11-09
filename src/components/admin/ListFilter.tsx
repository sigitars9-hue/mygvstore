"use client";
import { useState } from "react";
import { Icon } from "@/components/Icons";

export default function ListFilter({ targetId }: { targetId: string }) {
  const [q, setQ] = useState("");

  const apply = (value: string) => {
    setQ(value);
    const term = value.trim().toLowerCase();
    const root = document.getElementById(targetId);
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-svc]").forEach((el) => {
      el.hidden = !!term && !(el.dataset.svc ?? "").includes(term);
    });
    root.querySelectorAll<HTMLDetailsElement>("[data-group]").forEach((g) => {
      const any = g.querySelectorAll("[data-svc]:not([hidden])").length > 0;
      g.hidden = !any;
      if (term) g.open = any;
    });
  };

  return (
    <div className="relative mt-4">
      <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={q}
        onChange={(e) => apply(e.target.value)}
        placeholder="Cari layanan (mis. explore, rail, 20000)"
        className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black"
      />
    </div>
  );
}