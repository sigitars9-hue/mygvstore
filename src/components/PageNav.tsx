"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function PageNav() {
  const router = useRouter();
  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));
  const pill =
    "flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 px-3.5 py-2 text-sm font-semibold text-[#0d0c22] shadow-sm backdrop-blur hover:border-black";
  return (
    <div className="sticky top-3 z-20 mb-4 flex items-center gap-2">
      <button type="button" onClick={back} className={pill}>
        <Icon name="back" className="h-4 w-4" />Kembali
      </button>
      <Link href="/" className={pill}>
        <Icon name="home" className="h-4 w-4" />Beranda
      </Link>
    </div>
  );
}