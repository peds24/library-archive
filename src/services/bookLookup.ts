import { Book } from '@/src/types/book';
import { fetchBookByISBN as fromOpenLibrary } from './openLibrary';
import { fetchBookByISBN as fromGoogleBooks } from './googleBooks';

// Tries Open Library first, falls back to Google Books if not found or OL is unreachable.
// Returns null only when neither source has the book.
// Throws only when Open Library fails AND Google Books has a network error.
export async function lookupByISBN(isbn: string): Promise<Book | null> {
  try {
    const ol = await fromOpenLibrary(isbn);
    if (ol) return ol;
  } catch {
    // Open Library unreachable — continue to fallback
  }

  return fromGoogleBooks(isbn);
}
