"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Book } from "@/lib/supabase";

type BooksMarketplaceProps = {
  books: Book[];
};

function getUsedBookMessage(book: Book) {
  return encodeURIComponent(
    `Hi, I want to buy the used copy of \"${book.title}\" by ${book.author} for ₹${book.price}. Is it available?`
  );
}

export default function BooksMarketplace({ books }: BooksMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [brokenImageIds, setBrokenImageIds] = useState<number[]>([]);

  const filteredBooks = useMemo(
    () =>
      books.filter((book) =>
        book.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ),
    [books, searchQuery]
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Half-life Bookstore
          </h1>
          <p className="mt-1 text-sm text-zinc-600 sm:text-base">
            Buy affordable used academic books or explore new affiliate options.
          </p>
        </div>
        <a
          href="/admin"
          className="inline-flex rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Admin
        </a>
      </header>

      <label className="mb-6 block">
        <span className="mb-2 block text-sm font-medium text-zinc-700">
          Search by title
        </span>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Type a book title"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
        />
      </label>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBooks.map((book) => {
          const isUsed = !book.is_affiliate;
          const actionHref = isUsed
            ? `https://wa.me/?text=${getUsedBookMessage(book)}`
            : book.link;
          const imageSrc = brokenImageIds.includes(book.id)
            ? "/book-placeholder.svg"
            : book.image_url || "/book-placeholder.svg";

          return (
            <article
              key={book.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
              <Image
                src={imageSrc}
                alt={book.title}
                width={400}
                height={176}
                unoptimized
                className="h-44 w-full object-cover"
                onError={() =>
                  setBrokenImageIds((current) =>
                    current.includes(book.id) ? current : [...current, book.id]
                  )
                }
              />
              <div className="space-y-2 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {isUsed ? "Used" : "Affiliate"}
                </p>
                <h2 className="line-clamp-2 text-lg font-semibold text-zinc-900">
                  {book.title}
                </h2>
                <p className="text-sm text-zinc-600">{book.author}</p>
                <p className="text-sm text-zinc-700">Condition: {book.condition}</p>
                {book.price !== null ? (
                  <p className="text-base font-semibold text-zinc-900">₹{book.price}</p>
                ) : (
                  <p className="text-base font-semibold text-zinc-900">Visit partner store</p>
                )}
                <a
                  href={actionHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
                >
                  {isUsed ? "Buy via WhatsApp" : "Buy from Affiliate"}
                </a>
              </div>
            </article>
          );
        })}
      </section>

      {filteredBooks.length === 0 ? (
        <p className="mt-6 text-center text-sm text-zinc-500">
          No books found for this title.
        </p>
      ) : null}
    </main>
  );
}
