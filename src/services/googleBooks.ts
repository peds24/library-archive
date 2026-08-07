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

interface BooksResponse {
  totalItems: number;
  items?: Array<{ volumeInfo: VolumeInfo }>;
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

  const { volumeInfo } = data.items[0];
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
