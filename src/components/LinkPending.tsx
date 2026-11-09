"use client";
import { useLinkStatus } from "next/link";

// Harus dipakai DI DALAM <Link>
export function LinkSpinner({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return pending ? (
    <span
      aria-label="Memuat"
      className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-[#0d0c22]"
    />
  ) : (
    <>{children}</>
  );
}

// Redupkan konten baris saat loading
export function LinkFade({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useLinkStatus();
  return <span className={`${className} transition-opacity ${pending ? "opacity-50" : ""}`}>{children}</span>;
}