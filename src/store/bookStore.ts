import { create } from 'zustand';
import { Book, BookStatus } from '@/src/types/book';
import mockBooks from '@/src/data/mock-books.json';

interface BookStore {
  books: Book[];
  addBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  updateStatus: (id: string, status: BookStatus) => void;
  updateBook: (id: string, updates: Partial<Pick<Book, 'genre' | 'pages'>>) => void;
}

export const useBookStore = create<BookStore>()((set) => ({
  books: mockBooks as Book[],
  addBook: (book) =>
    set((state) => ({ books: [book, ...state.books] })),
  deleteBook: (id) =>
    set((state) => ({ books: state.books.filter((b) => b.id !== id) })),
  updateStatus: (id, status) =>
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? { ...b, status } : b)),
    })),
  updateBook: (id, updates) =>
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),
}));
