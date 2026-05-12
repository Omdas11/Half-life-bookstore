import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type InventoryBook = {
  id: number;
  title: string;
  author: string;
  price: number;
  condition: string;
  image_url: string;
  in_stock: boolean;
};

export type AffiliateProduct = {
  id: number;
  title: string;
  affiliate_url: string;
  image_url: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  price: number | null;
  condition: string;
  image_url: string;
  is_affiliate: boolean;
  link: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const fallbackBooks: Book[] = [
  {
    id: "book-1",
    title: "Engineering Mathematics",
    author: "B. S. Grewal",
    price: 399,
    condition: "Used - Good",
    image_url: "/book-placeholder.svg",
    is_affiliate: false,
    link: "",
  },
  {
    id: "affiliate-2",
    title: "Introduction to Algorithms",
    author: "Affiliate",
    price: null,
    condition: "New",
    image_url: "/book-placeholder.svg",
    is_affiliate: true,
    link: "https://www.amazon.in/",
  },
];

let browserClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function getSupabaseBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return browserClient;
}

export async function getBooks(): Promise<Book[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return fallbackBooks;
  }

  const [{ data: inventoryData, error: inventoryError }, { data: affiliateData, error: affiliateError }] = await Promise.all([
    supabase
      .from("books")
      .select("id,title,author,price,condition,image_url,in_stock")
      .eq("in_stock", true)
      .order("id", { ascending: true }),
    supabase
      .from("affiliate_products")
      .select("id,title,affiliate_url,image_url")
      .order("id", { ascending: true }),
  ]);

  if (inventoryError || affiliateError) {
    return fallbackBooks;
  }

  const inventoryBooks: Book[] = ((inventoryData as InventoryBook[] | null) ?? []).map((book) => ({
    id: `book-${book.id}`,
    title: book.title,
    author: book.author,
    price: book.price,
    condition: book.condition,
    image_url: book.image_url,
    is_affiliate: false,
    link: "",
  }));

  const affiliateBooks: Book[] = ((affiliateData as AffiliateProduct[] | null) ?? []).map((product) => ({
    id: `affiliate-${product.id}`,
    title: product.title,
    author: "Affiliate",
    price: null,
    condition: "New",
    image_url: product.image_url,
    is_affiliate: true,
    link: product.affiliate_url,
  }));

  return [...inventoryBooks, ...affiliateBooks];
}
