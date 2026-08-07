import { Book } from '@/src/types/book';

const BASE = 'https://openlibrary.org/api/books';

interface OLAuthor {
  name: string;
}

interface OLSubject {
  name: string;
}

interface OLCover {
  small?: string;
  medium?: string;
  large?: string;
}

interface OLBookData {
  title?: string;
  authors?: OLAuthor[];
  number_of_pages?: number;
  publish_date?: string;
  subjects?: OLSubject[];
  cover?: OLCover;
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

  // Use the `cover` object the API actually returns rather than guessing at the
  // ISBN-keyed CDN URL (`covers.openlibrary.org/b/isbn/{isbn}-L.jpg`). That guess
  // is not safe: for a book Open Library has metadata but no scan for, the CDN
  // answers 200 OK with a 1×1, 43-byte blank instead of 404ing, so the app would
  // store a URL that renders as an empty box. The `cover` key is simply absent
  // when there's no cover, which is unambiguous.
  const coverImage = bookData.cover?.large ?? bookData.cover?.medium ?? '';

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
