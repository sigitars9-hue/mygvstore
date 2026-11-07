import "./globals.css";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import Header from "@/components/Header";

const mona = Mona_Sans({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "JokiKu: Jasa Joki Terpercaya",
  description: "Booster profesional, akun aman, progres bisa dipantau real-time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
<body className={`${mona.className} bg-white text-gray-900 antialiased`}>
  <Header />
  <main className="mx-auto max-w-7xl p-5">{children}</main>
</body>
    </html>
  );
}