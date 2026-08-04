import { Book } from '@/src/types/book';

const BASE = 'https://www.googleapis.com/books/v1/volumes';

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

export async function fetchBookByISBN(isbn: string): Promise<Book | null> {
  const res = await fetch(`${BASE}?q=isbn:${isbn}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: BooksResponse = await res.json();
  if (!data.items?.length) return null;

  const { volumeInfo } = data.items[0];

  // Google returns http:// thumbnails — upgrade to https and bump zoom for better resolution
  const rawCover = volumeInfo.imageLinks?.thumbnail ?? '';
  const coverImage = rawCover.replace('http://', 'https://').replace('zoom=1', 'zoom=3');

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
