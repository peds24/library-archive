import { useState } from 'react';
import { FlatList, View } from 'react-native';
import BookCard from '@/src/components/BookCard';
import FilterBar from '@/src/components/FilterBar';
import { Book, BookStatus } from '@/src/types/book';
import rawBooks from '@/src/data/mock-books.json';

const books = rawBooks as Book[];

type FilterOption = 'all' | BookStatus;
type SortOption = 'recent' | 'az' | 'za';

const STATUS_FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All', value: 'all' },
  { label: 'Reading', value: 'reading' },
  { label: 'TBR', value: 'tbr' },
  { label: 'Read', value: 'read' },
  { label: 'Shelved', value: 'shelved' },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Recent', value: 'recent' },
  { label: 'A–Z', value: 'az' },
  { label: 'Z–A', value: 'za' },
];

export default function LibraryScreen() {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('recent');

  const displayed = books
    .filter((b) => filter === 'all' || b.status === filter)
    .sort((a, b) => {
      if (sort === 'az') return a.title.localeCompare(b.title);
      if (sort === 'za') return b.title.localeCompare(a.title);
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

  return (
    <View className="flex-1 bg-stone-50">
      <FilterBar filters={STATUS_FILTERS} active={filter} onSelect={setFilter} />
      <FilterBar filters={SORT_OPTIONS} active={sort} onSelect={setSort} />
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}
        renderItem={({ item }) => <BookCard book={item} variant="compact" showStatus />}
      />
    </View>
  );
}
