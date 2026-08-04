import { create } from 'zustand';
import { Book, BookStatus } from '@/src/types/book';
import { dbAddBook, dbDeleteBook, dbUpdateBook, dbUpdateStatus } from '@/src/services/database';

interface BookStore {
  books: Book[];
  hydrate: (books: Book[]) => void;
  addBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  updateStatus: (id: string, status: BookStatus) => void;
  updateBook: (id: string, updates: Partial<Pick<Book, 'genre' | 'pages'>>) => void;
}

export const useBookStore = create<BookStore>()((set) => ({
  books: [],
  hydrate: (books) => set({ books }),
  addBook: (book) => {
    dbAddBook(book);
    set((state) => ({ books: [book, ...state.books] }));
  },
  deleteBook: (id) => {
    dbDeleteBook(id);
    set((state) => ({ books: state.books.filter((b) => b.id !== id) }));
  },
  updateStatus: (id, status) => {
    dbUpdateStatus(id, status);
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? { ...b, status } : b)),
    }));
  },
  updateBook: (id, updates) => {
    dbUpdateBook(id, updates);
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  },
}));
