import { createClient } from "@supabase/supabase-js";

export type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  condition: string;
  image_url: string;
  is_affiliate: boolean;
  link: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const fallbackBooks: Book[] = [
  {
    id: 1,
    title: "Engineering Mathematics",
    author: "B. S. Grewal",
    price: 399,
    condition: "Used - Good",
    image_url: "/book-placeholder.svg",
    is_affiliate: false,
    link: "",
  },
  {
    id: 2,
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson, Rivest, Stein",
    price: 1199,
    condition: "New",
    image_url: "/book-placeholder.svg",
    is_affiliate: true,
    link: "https://www.amazon.in/",
  },
];

export function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export async function getBooks(): Promise<Book[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return fallbackBooks;
  }

  const { data, error } = await supabase
    .from("books")
    .select("id,title,author,price,condition,image_url,is_affiliate,link")
    .order("id", { ascending: true });

  if (error) {
    return fallbackBooks;
  }

  return (data as Book[]) ?? fallbackBooks;
}
