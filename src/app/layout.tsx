import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "JokiKu: Jasa Joki Terpercaya",
  description: "Booster profesional, akun aman, progres bisa dipantau real-time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Header />
        <main className="mx-auto max-w-5xl p-5">{children}</main>
      </body>
    </html>
  );
}