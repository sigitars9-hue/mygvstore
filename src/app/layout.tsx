import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import CartBar from "@/components/CartBar";
import NavProgress from "@/components/NavProgress";

const mona = Mona_Sans({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Gvstore: Jasa Joki Terpercaya",
  description: "Booster profesional, akun aman, Dengan Customer Service terbaik disetiap game, Gvstore adalah jasa joki terpercaya untuk game favoritmu.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c22" },
  ],
};

// Jalan sebelum halaman tampil, supaya tidak ada kedipan terang saat mode gelap
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${mona.className} bg-background text-foreground antialiased`}>
        <SiteHeader />
        <main className="mx-auto max-w-7xl p-5">{children}</main>
        <CartBar />
        <NavProgress />
      </body>
    </html>
  );
}