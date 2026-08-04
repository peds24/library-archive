export type BookStatus = 'shelved' | 'reading' | 'tbr' | 'read';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  genre: string;
  pages: number;
  publishedDate: string;
  status: BookStatus;
  dateAdded: string;
}
