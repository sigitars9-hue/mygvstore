"use client";
import { useEffect, useState } from "react";

const KEY = "jokiku-saved";

export default function SaveButton({ id, className = "h-14 w-14" }: { id: string; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try { setOn((JSON.parse(localStorage.getItem(KEY) || "[]") as string[]).includes(id)); } catch {}
  }, [id]);
  const toggle = () => {
    try {
      const a = new Set<string>(JSON.parse(localStorage.getItem(KEY) || "[]"));
      if (on) a.delete(id); else a.add(id);
      localStorage.setItem(KEY, JSON.stringify([...a]));
    } catch {}
    setOn(!on);
  };
  return (
    <button onClick={toggle} aria-label={on ? "Hapus dari favorit" : "Simpan ke favorit"}
className={`flex ${className} shrink-0 items-center justify-center rounded-full border border-gray-200 hover:border-black`}>
      <svg key={String(on)} viewBox="0 0 24 24" className={`h-6 w-6 ${on ? "pop text-pink-500" : ""}`}
        fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M6 3h12v18l-6-4.5L6 21V3Z" />
      </svg>
    </button>
  );
}