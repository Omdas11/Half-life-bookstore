import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import SiteChrome from "@/app/components/site-chrome";
import "./globals.css";

const editorialFont = localFont({
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
  variable: "--font-editorial",
  display: "swap",
});

const defaultSiteUrl = "https://half-life-bookstore.vercel.app";
const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? defaultSiteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Half-life Bookstore | Used Academic Books",
    template: "%s | Half-life Bookstore",
  },
  description:
    "Half-life Bookstore is a curated marketplace for used academic books, research guides, and partner titles with fast local delivery.",
  applicationName: "Half-life Bookstore",
  keywords: [
    "used academic books",
    "textbooks",
    "research library",
    "bookstore",
    "affiliate books",
    "student books",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Half-life Bookstore | Used Academic Books",
    description:
      "Shop curated used academic books, build bundles, and discover partner editions in a modern research-focused bookstore.",
    siteName: "Half-life Bookstore",
  },
  twitter: {
    card: "summary",
    title: "Half-life Bookstore | Used Academic Books",
    description:
      "Browse used academic books, curated bundles, and partner editions from Half-life Bookstore.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${editorialFont.variable}`}>
      <body className="min-h-full">
        <SiteChrome>{children}</SiteChrome>
        <Analytics />
      </body>
    </html>
  );
}
