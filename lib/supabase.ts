import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type InventoryBook = {
  id: number;
  title: string;
  author: string;
  price: number;
  condition: string;
  image_url: string | null;
  image_urls: string[] | null;
  in_stock: boolean;
};

export type AffiliateProduct = {
  id: number;
  title: string;
  affiliate_url: string;
  image_url: string | null;
  image_urls: string[] | null;
};

export type Book = {
  id: string;
  product_id: number;
  product_type: "book" | "affiliate";
  title: string;
  author: string;
  price: number | null;
  condition: string;
  image_urls: string[];
  is_affiliate: boolean;
  link: string;
};

export type InvoiceItem = {
  product_id: number;
  product_type: "book" | "affiliate";
  title: string;
  quantity: number;
  unit_price: number;
};

export type InvoiceRecord = {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  items: InvoiceItem[];
  created_at: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
    return [];
  }

  const [
    { data: inventoryData, error: inventoryError },
    { data: affiliateData, error: affiliateError },
  ] = await Promise.all([
    supabase
      .from("books")
      .select("id,title,author,price,condition,image_url,image_urls,in_stock")
      .eq("in_stock", true)
      .order("id", { ascending: true })
      .returns<InventoryBook[]>(),
    supabase
      .from("affiliate_products")
      .select("id,title,affiliate_url,image_url,image_urls")
      .order("id", { ascending: true })
      .returns<AffiliateProduct[]>(),
  ]);

  if (inventoryError || affiliateError) {
    return [];
  }

  const inventoryBooks: Book[] = (inventoryData ?? []).map((book) => {
    const imageUrls =
      book.image_urls?.filter((imageUrl) => imageUrl && imageUrl.trim().length > 0) ?? [];
    if (book.image_url && !imageUrls.includes(book.image_url)) {
      imageUrls.unshift(book.image_url);
    }
    return {
      id: `book-${book.id}`,
      product_id: book.id,
      product_type: "book",
      title: book.title,
      author: book.author,
      price: book.price,
      condition: book.condition,
      image_urls: imageUrls.length > 0 ? imageUrls : ["/book-placeholder.svg"],
      is_affiliate: false,
      link: "",
    };
  });

  const affiliateBooks: Book[] = (affiliateData ?? []).map((product) => {
    const imageUrls =
      product.image_urls?.filter((imageUrl) => imageUrl && imageUrl.trim().length > 0) ?? [];
    if (product.image_url && !imageUrls.includes(product.image_url)) {
      imageUrls.unshift(product.image_url);
    }
    return {
      id: `affiliate-${product.id}`,
      product_id: product.id,
      product_type: "affiliate",
      title: product.title,
      author: "Affiliate",
      price: null,
      condition: "New",
      image_urls: imageUrls.length > 0 ? imageUrls : ["/book-placeholder.svg"],
      is_affiliate: true,
      link: product.affiliate_url,
    };
  });

  return [...inventoryBooks, ...affiliateBooks];
}
