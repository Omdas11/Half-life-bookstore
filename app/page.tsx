import BooksMarketplace from "@/app/components/books-marketplace";
import { getBooks } from "@/lib/supabase";

export default async function Home() {
  const books = await getBooks();

  return <BooksMarketplace books={books} />;
}
