import type { Metadata } from "next";
import Script from "next/script";
import BooksMarketplace from "@/app/components/books-marketplace";
import { getBooks } from "@/lib/supabase";

export const dynamic = "force-dynamic";
const googleSiteVerificationToken =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const googleSiteVerificationMeta = googleSiteVerificationToken
  ? { "google-site-verification": googleSiteVerificationToken }
  : undefined;

export const metadata: Metadata = {
  title: "Archive Marketplace",
  description:
    "Browse used academic books, verified partner titles, and curated bundles from Half-life Bookstore.",
  ...(googleSiteVerificationMeta ? { other: googleSiteVerificationMeta } : {}),
  keywords: [
    "used books",
    "academic bookstore",
    "research titles",
    "textbook marketplace",
    "student books",
  ],
};

export default async function Home() {
  const books = await getBooks();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BookStore",
    name: "Half-life Bookstore",
    url: "https://half-life-bookstore.vercel.app",
    description:
      "Curated marketplace for used academic books, partner editions, and research guides.",
    areaServed: "IN",
    makesOffer: {
      "@type": "OfferCatalog",
      name: "Used academic books and partner titles",
    },
  };
  const structuredDataJson = JSON.stringify(structuredData)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />
      <BooksMarketplace books={books} />
    </>
  );
}
