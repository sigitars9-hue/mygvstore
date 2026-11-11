import "./globals.css";
import type { Metadata } from "next";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
<body className={`${mona.className} bg-white text-gray-900 antialiased`}>
  <SiteHeader />
  <main className="mx-auto max-w-7xl p-5">{children}</main>
<CartBar />
  <NavProgress />
</body>
    </html>
  );
}