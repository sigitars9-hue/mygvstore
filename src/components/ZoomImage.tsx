"use client";
import { useRef } from "react";
import Image from "next/image";
import { Icon } from "@/components/Icons";

export default function ZoomImage({
  src, alt, sizes, className = "", style, children,
}: {
  src: string; alt: string; sizes: string; className?: string;
  style?: React.CSSProperties; children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        aria-label={`Perbesar ${alt}`}
        onClick={() => ref.current?.showModal()}
        style={style}
        className={`group relative block overflow-hidden ${className}`}
      >
        <Image
          src={src} alt={alt} fill sizes={sizes}
          className="object-cover transition duration-500 ease-out group-hover:scale-105"
        />
        {children}
      </button>

      <dialog
        ref={ref}
        onClick={() => ref.current?.close()}
        className="zoom m-auto max-h-[92dvh] w-[min(94vw,900px)] bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        <div className="relative flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="max-h-[88dvh] w-auto max-w-full rounded-2xl object-contain shadow-2xl" />
          <span className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:rotate-90 hover:scale-110">
            <Icon name="close" className="h-5 w-5" />
          </span>
        </div>
      </dialog>
    </>
  );
}