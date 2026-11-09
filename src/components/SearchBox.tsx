"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const first = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce 300ms, lalu sinkronkan ke URL (param k tetap dipertahankan)
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const v = value.trim();
      if (v) params.set("q", v); else params.delete("q");
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 300);
    return () => clearTimeout(t);
  }, [value, pathname, router]);

  // Tekan "/" untuk fokus ke kotak pencarian
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
useEffect(() => {
    if (document.activeElement !== inputRef.current) setValue(initial);
  }, [initial]);
  return (
    <div className="group relative rounded-full border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 focus-within:border-[#0d0c22] focus-within:shadow-[0_6px_20px_-10px_rgba(13,12,34,0.35)]">
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400 transition-colors group-focus-within:text-[#0d0c22]">
        {pending ? (
          <span className="block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#0d0c22]" />
        ) : (
          <Icon name="search" className="h-4 w-4" />
        )}
      </span>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") setValue(""); }}
        placeholder="Cari jokimu"
        enterKeyHint="search"
        autoComplete="off"
        className="w-full rounded-full bg-transparent py-3 pl-11 pr-12 text-base font-medium text-[#0d0c22] outline-none placeholder:text-gray-400 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />

      {value ? (
        <button
          type="button"
          onClick={() => { setValue(""); inputRef.current?.focus(); }}
          aria-label="Hapus pencarian"
          className="animate-pop-in absolute inset-y-0 right-2.5 my-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-black active:scale-90"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute inset-y-0 right-4 my-auto hidden h-5 items-center rounded-md border border-gray-200 px-1.5 text-[10px] font-bold text-gray-400 sm:flex">
          /
        </kbd>
      )}
    </div>
  );
}