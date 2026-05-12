"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient,
  type AffiliateProduct,
  type InventoryBook,
} from "@/lib/supabase";

const placeholderImage = "/book-placeholder.svg";

export default function AdminDashboard() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const isSupabaseConfigured = Boolean(supabase);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [books, setBooks] = useState<InventoryBook[]>([]);
  const [affiliateProducts, setAffiliateProducts] = useState<AffiliateProduct[]>([]);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isSubmittingBook, setIsSubmittingBook] = useState(false);
  const [isSubmittingAffiliate, setIsSubmittingAffiliate] = useState(false);

  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookCondition, setBookCondition] = useState("Used - Good");
  const [bookPrice, setBookPrice] = useState("");
  const [bookImage, setBookImage] = useState<File | null>(null);
  const [bookInStock, setBookInStock] = useState(true);

  const [affiliateTitle, setAffiliateTitle] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [affiliateImageUrl, setAffiliateImageUrl] = useState("");

  const fetchDashboardData = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const [{ data: bookRows, error: booksError }, { data: affiliateRows, error: affiliateError }] =
      await Promise.all([
        supabase
          .from("books")
          .select("id,title,author,price,condition,image_url,in_stock")
          .order("id", { ascending: false }),
        supabase
          .from("affiliate_products")
          .select("id,title,affiliate_url,image_url")
          .order("id", { ascending: false }),
      ]);

    if (booksError || affiliateError) {
      setDashboardError("Unable to load admin data. Verify RLS policies and login access.");
      return;
    }

    setDashboardError(null);
    setBooks((bookRows as InventoryBook[] | null) ?? []);
    setAffiliateProducts((affiliateRows as AffiliateProduct[] | null) ?? []);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setAuthError(error.message);
      } else {
        setSession(data.session);
      }

      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (session) {
      const loadData = async () => {
        await fetchDashboardData();
      };
      void loadData();
    }
  }, [fetchDashboardData, session]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    setEmail("");
    setPassword("");
  };

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
    setBooks([]);
    setAffiliateProducts([]);
  };

  const handleBookSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !session) {
      return;
    }

    const parsedPrice = Number(bookPrice);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setDashboardError("Enter a valid non-negative price.");
      return;
    }

    setDashboardError(null);
    setIsSubmittingBook(true);

    try {
      let uploadedImageUrl = placeholderImage;

      if (bookImage) {
        const filePath = `${session.user.id}/${Date.now()}-${bookImage.name.replaceAll(" ", "-")}`;
        const { error: uploadError } = await supabase.storage
          .from("book-images")
          .upload(filePath, bookImage, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicData } = supabase.storage
          .from("book-images")
          .getPublicUrl(filePath);

        uploadedImageUrl = publicData.publicUrl;
      }

      const { error } = await supabase.from("books").insert({
        title: bookTitle,
        author: bookAuthor,
        condition: bookCondition,
        price: parsedPrice,
        image_url: uploadedImageUrl,
        in_stock: bookInStock,
      });

      if (error) {
        throw new Error(error.message);
      }

      setBookTitle("");
      setBookAuthor("");
      setBookCondition("Used - Good");
      setBookPrice("");
      setBookImage(null);
      setBookInStock(true);

      await fetchDashboardData();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Unable to create book.");
    } finally {
      setIsSubmittingBook(false);
    }
  };

  const handleToggleStock = async (book: InventoryBook) => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase
      .from("books")
      .update({ in_stock: !book.in_stock })
      .eq("id", book.id);

    if (error) {
      setDashboardError(error.message);
      return;
    }

    await fetchDashboardData();
  };

  const handleAffiliateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !session) {
      return;
    }

    setDashboardError(null);
    setIsSubmittingAffiliate(true);

    try {
      const { error } = await supabase.from("affiliate_products").insert({
        title: affiliateTitle,
        affiliate_url: affiliateUrl,
        image_url: affiliateImageUrl || placeholderImage,
      });

      if (error) {
        throw new Error(error.message);
      }

      setAffiliateTitle("");
      setAffiliateUrl("");
      setAffiliateImageUrl("");
      await fetchDashboardData();
    } catch (error) {
      setDashboardError(
        error instanceof Error ? error.message : "Unable to add affiliate product."
      );
    } finally {
      setIsSubmittingAffiliate(false);
    }
  };

  if (authLoading) {
    return <main className="mx-auto max-w-5xl px-4 py-8">Loading admin dashboard…</main>;
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900">Admin Login</h1>
        <p className="mb-6 text-sm text-zinc-600">
          Sign in with your Supabase admin account.
        </p>
        <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
          <label className="block text-sm font-medium text-zinc-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          {(authError || dashboardError || !isSupabaseConfigured) && (
            <p className="text-sm text-red-600">
              {authError ??
                dashboardError ??
                "Supabase keys are missing. Add env vars before using admin."}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600">Manage inventory and affiliate products.</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
        >
          Sign out
        </button>
      </header>

      {dashboardError ? <p className="mb-4 text-sm text-red-600">{dashboardError}</p> : null}

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleBookSubmit}
          className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-zinc-900">Add book inventory</h2>
          <label className="block text-sm font-medium text-zinc-700">
            Title
            <input
              required
              value={bookTitle}
              onChange={(event) => setBookTitle(event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Author
            <input
              required
              value={bookAuthor}
              onChange={(event) => setBookAuthor(event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Condition
            <input
              required
              value={bookCondition}
              onChange={(event) => setBookCondition(event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Price (INR)
            <input
              required
              type="number"
              min="0"
              value={bookPrice}
              onChange={(event) => setBookPrice(event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Book image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setBookImage(event.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <input
              type="checkbox"
              checked={bookInStock}
              onChange={(event) => setBookInStock(event.target.checked)}
            />
            In stock
          </label>
          <button
            type="submit"
            disabled={isSubmittingBook}
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmittingBook ? "Saving…" : "Add book"}
          </button>
        </form>

        <form
          onSubmit={handleAffiliateSubmit}
          className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-zinc-900">Add affiliate product</h2>
          <p className="text-sm text-zinc-600">
            Use direct image URLs when scraping is blocked.
          </p>
          <label className="block text-sm font-medium text-zinc-700">
            Product title
            <input
              required
              value={affiliateTitle}
              onChange={(event) => setAffiliateTitle(event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Affiliate URL
            <input
              required
              type="url"
              value={affiliateUrl}
              onChange={(event) => setAffiliateUrl(event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Direct image URL
            <input
              type="url"
              value={affiliateImageUrl}
              onChange={(event) => setAffiliateImageUrl(event.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmittingAffiliate}
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmittingAffiliate ? "Saving…" : "Add affiliate product"}
          </button>
        </form>
      </section>

      <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Book inventory</h2>
        <div className="space-y-3">
          {books.length === 0 ? (
            <p className="text-sm text-zinc-600">No books yet.</p>
          ) : (
            books.map((book) => (
              <article
                key={book.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3"
              >
                <div>
                  <p className="font-medium text-zinc-900">{book.title}</p>
                  <p className="text-sm text-zinc-600">
                    {book.author} • ₹{book.price} • {book.condition}
                  </p>
                  <p className="text-xs text-zinc-500">{book.in_stock ? "In stock" : "Out of stock"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleStock(book)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700"
                >
                  Mark as {book.in_stock ? "out of stock" : "in stock"}
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Affiliate products</h2>
        <div className="space-y-3">
          {affiliateProducts.length === 0 ? (
            <p className="text-sm text-zinc-600">No affiliate products yet.</p>
          ) : (
            affiliateProducts.map((product) => (
              <article key={product.id} className="rounded-xl border border-zinc-200 p-3">
                <p className="font-medium text-zinc-900">{product.title}</p>
                <a
                  href={product.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-700 underline"
                >
                  {product.affiliate_url}
                </a>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
