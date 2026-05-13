import localFont from "next/font/local";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const tiempos = localFont({
  src: [
    {
      path: "../font/TestTiemposText-Regular-BF66457a50cd521.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../font/TestTiemposText-Medium-BF66457a508489a.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../font/TestTiemposText-Semibold-BF66457a4fed201.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../font/TestTiemposText-Bold-BF66457a4f03c40.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-tiempos",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Half-life Bookstore",
  description:
    "A minimalist marketplace for used academic books and affiliate links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${tiempos.variable}`}>
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
