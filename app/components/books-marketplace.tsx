"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Book } from "@/lib/supabase";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type BooksMarketplaceProps = {
  books: Book[];
};

type CartItem = {
  book: Book;
  quantity: number;
};

export default function BooksMarketplace({ books }: BooksMarketplaceProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [brokenImageUrls, setBrokenImageUrls] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<Record<string, number>>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  const filteredBooks = useMemo(
    () =>
      books.filter((book) =>
        book.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ),
    [books, searchQuery]
  );
  const hasListings = books.length > 0;

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + (item.book.price ?? 0) * item.quantity, 0),
    [cartItems]
  );
  const formattedCartTotal = useMemo(() => cartTotal.toFixed(2), [cartTotal]);

  const handleAddToCart = (book: Book) => {
    if (book.price === null || book.is_affiliate) {
      return;
    }
    setCartItems((current) => {
      const existing = current.find((item) => item.book.id === book.id);
      if (existing) {
        return current.map((item) =>
          item.book.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { book, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (bookId: string, nextQuantity: number) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.book.id === bookId ? { ...item, quantity: Math.max(0, nextQuantity) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setCheckoutMessage("Supabase is not configured, so invoice cannot be sent to admin.");
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutMessage("Add at least one item to cart.");
      return;
    }

    setIsSubmittingInvoice(true);
    setCheckoutMessage(null);

    const items = cartItems.map((item) => ({
      product_id: item.book.product_id,
      product_type: item.book.product_type,
      title: item.book.title,
      quantity: item.quantity,
      unit_price: item.book.price ?? 0,
    }));

    const { error } = await supabase.from("invoices").insert({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_address: customerAddress.trim(),
      total_amount: cartTotal,
      status: "pending",
      items,
    });

    if (error) {
      setCheckoutMessage(`Unable to submit invoice: ${error.message}`);
      setIsSubmittingInvoice(false);
      return;
    }

    setCartItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCheckoutMessage("Invoice generated and sent to admin for delivery processing.");
    setIsSubmittingInvoice(false);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 lg:px-8">
      <header className="mb-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <p className="font-label text-[0.65rem] text-[var(--color-on-surface-variant)]">
            Curated archive
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Half-life Bookstore
          </h1>
          <p className="mt-4 text-base text-[var(--color-on-surface-variant)] sm:text-lg">
            Discover used academic titles, verified partner editions, and fast delivery. Build
            bundles, generate a single invoice, and keep your research shelf moving.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-[0.7rem] text-[var(--color-on-surface-variant)]">
            <span className="font-label rounded-full border border-[var(--color-outline-variant)] px-3 py-1">
              Used &amp; affiliate
            </span>
            <span className="font-label rounded-full border border-[var(--color-outline-variant)] px-3 py-1">
              Multi-book checkout
            </span>
            <span className="font-label rounded-full border border-[var(--color-outline-variant)] px-3 py-1">
              Local delivery
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-6">
          <p className="font-label text-[0.65rem] text-[var(--color-on-surface-variant)]">
            Archive highlights
          </p>
          <p className="mt-3 text-sm text-[var(--color-on-surface)]">
            Updated weekly with new university lists, exam prep guides, and core research
            references.
          </p>
          <div className="mt-4 space-y-2 text-sm text-[var(--color-on-surface-variant)]">
            <p>• Hand-checked condition notes</p>
            <p>• Verified affiliate storefronts</p>
            <p>• Single invoice for all used items</p>
          </div>
        </div>
      </header>

      <section className="mb-8" aria-label="Search catalog">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--color-on-surface-variant)]">
            Search by title
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search for a title, author, or series"
            className="w-full rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
          />
        </label>
      </section>

      {hasListings ? (
        <section className="mb-12" aria-labelledby="catalog-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-label text-[0.65rem] text-[var(--color-on-surface-variant)]">
                Marketplace catalog
              </p>
              <h2 id="catalog-heading" className="mt-2 text-2xl font-semibold">
                Available titles
              </h2>
            </div>
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              {filteredBooks.length} titles matched
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => {
              const isUsed = !book.is_affiliate;
              const imageIndex = selectedImageIndex[book.id] ?? 0;
              const imageSrc =
                book.image_urls[imageIndex] && !brokenImageUrls.includes(book.image_urls[imageIndex])
                  ? book.image_urls[imageIndex]
                  : "/book-placeholder.svg";

              return (
                <article
                  key={book.id}
                  className="relative overflow-hidden rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]"
                >
                  <span className="absolute left-0 top-0 h-full w-1 bg-[var(--color-primary)]" aria-hidden />
                  <div className="flex h-52 items-center justify-center bg-[var(--color-surface-container)] p-3">
                    <Image
                      src={imageSrc}
                      alt={book.title}
                      width={400}
                      height={200}
                      unoptimized
                      className="h-full w-full object-contain"
                      onError={() =>
                        setBrokenImageUrls((current) =>
                          current.includes(imageSrc) ? current : [...current, imageSrc]
                        )
                      }
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <p className="font-label text-[0.65rem] text-[var(--color-on-surface-variant)]">
                      {isUsed ? "Used" : "Affiliate"}
                    </p>
                    <h3 className="line-clamp-2 text-lg font-semibold text-[var(--color-on-surface)]">
                      {book.title}
                    </h3>
                    <p className="text-sm text-[var(--color-on-surface-variant)]">{book.author}</p>
                    <p className="text-sm text-[var(--color-on-surface-variant)]">
                      Condition: {book.condition}
                    </p>
                    {book.image_urls.length > 1 ? (
                      <div className="flex flex-wrap gap-2">
                        {book.image_urls.map((imageUrl, index) => (
                          <button
                            key={`${book.id}-${imageUrl}`}
                            type="button"
                            onClick={() =>
                              setSelectedImageIndex((current) => ({
                                ...current,
                                [book.id]: index,
                              }))
                            }
                            className={`rounded-md border px-2 py-1 text-[0.65rem] ${
                              imageIndex === index
                                ? "border-[var(--color-on-surface)] bg-[var(--color-on-surface)] text-[var(--color-on-primary)]"
                                : "border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)]"
                            }`}
                          >
                            Image {index + 1}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {book.price !== null ? (
                      <p className="text-base font-semibold text-[var(--color-on-surface)]">
                        <span className="font-editorial">₹{book.price}</span>
                      </p>
                    ) : (
                      <p className="text-base font-semibold text-[var(--color-on-surface)]">
                        Visit partner store
                      </p>
                    )}
                    {isUsed ? (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(book)}
                        className="inline-flex w-full items-center justify-center rounded-md bg-[var(--color-on-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-strong)]"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <a
                        href={book.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-strong)]"
                      >
                        Buy from Affiliate
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="mb-12 rounded-lg border border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 py-10 text-center">
          <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">
            No books are currently available.
          </h2>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            Check back soon for fresh listings and new partner offers.
          </p>
        </section>
      )}

      <section
        id="cart"
        className="rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6"
      >
        <p className="font-label text-[0.65rem] text-[var(--color-on-surface-variant)]">
          Checkout
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--color-on-surface)]">
          Shopping Cart
        </h2>
        <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
          Add multiple books and generate one invoice for local delivery.
        </p>
        <div className="mt-4 space-y-3">
          {cartItems.length === 0 ? (
            <p className="text-sm text-[var(--color-on-surface-variant)]">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <article
                key={item.book.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--color-outline-variant)] p-3"
              >
                <div>
                  <p className="font-medium text-[var(--color-on-surface)]">{item.book.title}</p>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">
                    <span className="font-editorial">₹{item.book.price}</span> × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.book.id, item.quantity - 1)}
                    className="rounded-md border border-[var(--color-outline-variant)] px-2 py-1 text-sm"
                  >
                    -
                  </button>
                  <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.book.id, item.quantity + 1)}
                    className="rounded-md border border-[var(--color-outline-variant)] px-2 py-1 text-sm"
                  >
                    +
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
        <p className="mt-4 text-base font-semibold text-[var(--color-on-surface)]">
          Total: <span className="font-editorial">₹{formattedCartTotal}</span>
        </p>
        <form onSubmit={handleCheckout} className="mt-4 space-y-3">
          <input
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-3 py-2 text-sm"
          />
          <input
            required
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Phone number"
            pattern="^[0-9+\\-\\s]{8,15}$"
            title="Enter a valid phone number (8 to 15 digits, spaces, + or -)."
            className="w-full rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-3 py-2 text-sm"
          />
          <textarea
            required
            minLength={10}
            value={customerAddress}
            onChange={(event) => setCustomerAddress(event.target.value)}
            placeholder="Delivery address"
            className="w-full rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-3 py-2 text-sm"
            rows={3}
          />
          <button
            type="submit"
            disabled={isSubmittingInvoice}
            className="inline-flex w-full items-center justify-center rounded-md bg-[var(--color-on-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-strong)] disabled:opacity-60"
          >
            {isSubmittingInvoice ? "Generating Invoice..." : "Buy & Generate Invoice"}
          </button>
        </form>
        {checkoutMessage ? (
          <p className="mt-3 text-sm text-[var(--color-on-surface-variant)]">
            {checkoutMessage}
          </p>
        ) : null}
      </section>

      {hasListings && filteredBooks.length === 0 ? (
        <p className="mt-6 text-center text-sm text-[var(--color-on-surface-variant)]">
          No books found for this title.
        </p>
      ) : null}
    </main>
  );
}
