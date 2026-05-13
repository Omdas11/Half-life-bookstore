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

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + (item.book.price ?? 0) * item.quantity, 0),
    [cartItems]
  );

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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Half-life Bookstore
          </h1>
          <p className="mt-1 text-sm text-zinc-600 sm:text-base">
            Buy affordable used academic books or explore new affiliate options.
          </p>
        </div>
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

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="flex h-52 items-center justify-center bg-zinc-100 p-3">
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
              <div className="space-y-2 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {isUsed ? "Used" : "Affiliate"}
                </p>
                <h2 className="text-lg font-semibold text-zinc-900">{book.title}</h2>
                <p className="text-sm text-zinc-600">{book.author}</p>
                <p className="text-sm text-zinc-700">Condition: {book.condition}</p>
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
                        className={`rounded-md border px-2 py-1 text-xs ${
                          imageIndex === index
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-300 text-zinc-700"
                        }`}
                      >
                        Image {index + 1}
                      </button>
                    ))}
                  </div>
                ) : null}
                {book.price !== null ? (
                  <p className="text-base font-semibold text-zinc-900">₹{book.price}</p>
                ) : (
                  <p className="text-base font-semibold text-zinc-900">Visit partner store</p>
                )}
                {isUsed ? (
                  <button
                    type="button"
                    onClick={() => handleAddToCart(book)}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
                  >
                    Buy from Affiliate
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section id="cart" className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900">Shopping Cart</h2>
        <p className="mt-1 text-sm text-zinc-600">Add multiple books and generate one invoice.</p>
        <div className="mt-4 space-y-3">
          {cartItems.length === 0 ? (
            <p className="text-sm text-zinc-600">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <article
                key={item.book.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3"
              >
                <div>
                  <p className="font-medium text-zinc-900">{item.book.title}</p>
                  <p className="text-sm text-zinc-600">
                    ₹{item.book.price} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.book.id, item.quantity - 1)}
                    className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.book.id, item.quantity + 1)}
                    className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                  >
                    +
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
        <p className="mt-4 text-base font-semibold text-zinc-900">Total: ₹{cartTotal.toFixed(2)}</p>
        <form onSubmit={handleCheckout} className="mt-4 space-y-3">
          <input
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2"
          />
          <input
            required
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Phone number"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2"
          />
          <textarea
            required
            value={customerAddress}
            onChange={(event) => setCustomerAddress(event.target.value)}
            placeholder="Delivery address"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2"
            rows={3}
          />
          <button
            type="submit"
            disabled={isSubmittingInvoice}
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
          >
            {isSubmittingInvoice ? "Generating Invoice..." : "Buy & Generate Invoice"}
          </button>
        </form>
        {checkoutMessage ? <p className="mt-3 text-sm text-zinc-700">{checkoutMessage}</p> : null}
      </section>

      {filteredBooks.length === 0 ? (
        <p className="mt-6 text-center text-sm text-zinc-500">
          No books found for this title.
        </p>
      ) : null}
    </main>
  );
}
