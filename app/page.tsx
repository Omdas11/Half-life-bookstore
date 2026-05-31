import BooksMarketplace from "@/app/components/books-marketplace";
import { getBooks } from "@/lib/supabase";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Archive Marketplace",
  description:
    "Browse used academic books, verified partner titles, and curated bundles from Half-life Bookstore.",
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BooksMarketplace books={books} />
    </>
  );
}
