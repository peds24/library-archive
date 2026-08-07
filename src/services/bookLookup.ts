import { Book } from '@/src/types/book';
import { googleCoverAtZoom, openLibraryCoverByISBN, resolveCover } from './covers';
import { fetchBookByISBN as fromOpenLibrary } from './openLibrary';
import { fetchBookByISBN as fromGoogleBooks } from './googleBooks';

// Tries Google Books first, falls back to Open Library if not found or Google is
// unreachable. Google has richer metadata (page counts, genres, publish dates are
// more consistently populated) and measurably larger cover art — 575px wide against
// Open Library's ~500px ceiling — so it makes the better primary source; Open Library
// needs no API key, so it still works when EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY is unset
// — in that case `fromGoogleBooks` returns null immediately and this falls straight
// through, meaning the app works out of the box with no configuration.
// Returns null only when neither source has the book.
// Throws only when Google Books fails AND Open Library has a network error.
export async function lookupByISBN(isbn: string): Promise<Book | null> {
  let book: Book | null = null;
  let viaGoogle = false;

  try {
    book = await fromGoogleBooks(isbn);
    viaGoogle = book !== null;
  } catch {
    // Google Books unreachable or rejected the key — continue to fallback
  }

  if (!book) book = await fromOpenLibrary(isbn);
  if (!book) return null;

  return { ...book, coverImage: await resolveCover(coverCandidates(book, isbn, viaGoogle)) };
}

// Best-first cover URLs. Whichever source supplied the metadata, the cover is
// resolved independently and validated, because both APIs happily hand back URLs
// that load fine but aren't covers (see `covers.ts`).
//
// When Google supplied the book, its zoom=3 render is the sharpest option, but it
// collapses to a landscape strip on some volumes — so Open Library's art is the
// second choice, and Google's own untouched zoom=1 thumbnail the last resort, since
// that one is always correctly proportioned even though it's small.
//
// When Open Library supplied the book, Google had nothing for this ISBN, so there
// is no Google cover to fall back to.
function coverCandidates(book: Book, isbn: string, viaGoogle: boolean): string[] {
  if (!viaGoogle) return [book.coverImage];
  return [book.coverImage, openLibraryCoverByISBN(isbn), googleCoverAtZoom(book.coverImage, 1)];
}
