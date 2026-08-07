import { Book } from '@/src/types/book';
import { googleCoverAtZoom } from './covers';

const BASE = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

interface VolumeInfo {
  title?: string;
  authors?: string[];
  categories?: string[];
  pageCount?: number;
  publishedDate?: string;
  imageLinks?: { thumbnail?: string };
}

interface Volume {
  id: string;
  volumeInfo: VolumeInfo;
}

interface BooksResponse {
  totalItems: number;
  items?: Volume[];
}

/**
 * Fetches a volume's own record.
 *
 * The `q=isbn:` search hands back a *projection* of `volumeInfo`, not the whole
 * thing, and the fields it drops come back as zero rather than as absent — so the
 * `?? 0` below never fires and a real book lands in the library claiming 0 pages.
 * Measured against the live API:
 *
 *   ISBN 9781534332560   search pageCount 0     volume record 536
 *   ISBN 9780345339683   search pageCount 133   volume record 320
 *   ISBN 9780316769488   search pageCount 228   volume record 240
 *
 * One extra request per lookup buys a page count that is actually right.
 * Returns null on any failure so the caller can fall back to the search payload.
 */
async function fetchVolumeRecord(id: string): Promise<VolumeInfo | null> {
  try {
    const url = new URL(`${BASE}/${id}`);
    if (API_KEY) url.searchParams.set('key', API_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data: { volumeInfo?: VolumeInfo } = await res.json();
    return data.volumeInfo ?? null;
  } catch {
    return null;
  }
}

// Returns null if no key configured or book not found. Throws on network error.
export async function fetchBookByISBN(isbn: string): Promise<Book | null> {
  if (!API_KEY) return null;

  const url = new URL(BASE);
  url.searchParams.set('q', `isbn:${isbn}`);
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Google Books HTTP ${res.status}`);

  const data: BooksResponse = await res.json();
  if (!data.items?.length) return null;

  const match = data.items[0];
  // Prefer the volume's full record. The search payload already carries title and
  // author, so a failed second call degrades the result rather than breaking it.
  const volumeInfo = (await fetchVolumeRecord(match.id)) ?? match.volumeInfo;

  const coverImage = googleCoverAtZoom(volumeInfo.imageLinks?.thumbnail ?? '', 3);

  return {
    id: isbn,
    title: volumeInfo.title ?? 'Unknown Title',
    author: volumeInfo.authors?.[0] ?? 'Unknown Author',
    coverImage,
    genre: volumeInfo.categories?.[0] ?? 'Uncategorized',
    pages: volumeInfo.pageCount ?? 0,
    publishedDate: volumeInfo.publishedDate ?? '',
    status: 'shelved',
    dateAdded: new Date().toISOString(),
  };
}
