import { Book } from '@/src/types/book';

const BASE = 'https://openlibrary.org/api/books';

interface OLAuthor {
  name: string;
}

interface OLSubject {
  name: string;
}

interface OLBookData {
  title?: string;
  authors?: OLAuthor[];
  number_of_pages?: number;
  publish_date?: string;
  subjects?: OLSubject[];
}

type OLResponse = Record<string, OLBookData>;

export async function fetchBookByISBN(isbn: string): Promise<Book | null> {
  const url = new URL(BASE);
  url.searchParams.set('bibkeys', `ISBN:${isbn}`);
  url.searchParams.set('jscmd', 'data');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: OLResponse = await res.json();
  const bookData = data[`ISBN:${isbn}`];
  if (!bookData) return null;

  // Use the Open Library cover CDN directly — same format already used in mock-books.json
  const coverImage = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

  return {
    id: isbn,
    title: bookData.title ?? 'Unknown Title',
    author: bookData.authors?.[0]?.name ?? 'Unknown Author',
    coverImage,
    genre: bookData.subjects?.[0]?.name ?? 'Uncategorized',
    pages: bookData.number_of_pages ?? 0,
    publishedDate: bookData.publish_date ?? '',
    status: 'shelved',
    dateAdded: new Date().toISOString(),
  };
}
