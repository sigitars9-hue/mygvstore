"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const POST = "https://www.instagram.com/p/C0s1Dgbx52i/";
const SRC = "https://www.instagram.com/embed.js";

export default function InstagramEmbed() {
  useEffect(() => {
    const run = () => window.instgrm?.Embeds.process();
    if (window.instgrm) {
      run();
      return;
    }
    let s = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (!s) {
      s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      document.body.appendChild(s);
    }
    s.addEventListener("load", run);
    return () => s?.removeEventListener("load", run);
  }, []);

  return (
    <div className="w-full max-w-[540px]">
      <blockquote
        className="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink={`${POST}?utm_source=ig_embed&utm_campaign=loading`}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: 0,
          borderRadius: 12,
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: 1,
          maxWidth: 540,
          minWidth: 280,
          padding: 0,
          width: "calc(100% - 2px)",
        }}
      >
        <a
          href={POST}
          target="_blank"
          rel="noreferrer"
          className="block p-6 text-center text-sm font-semibold text-blue-500"
        >
          Lihat postingan di Instagram
        </a>
      </blockquote>
    </div>
  );
}