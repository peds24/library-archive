import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import BookCard from '@/src/components/BookCard';
import FilterBar from '@/src/components/FilterBar';
import { useBookStore } from '@/src/store/bookStore';
import { BookStatus } from '@/src/types/book';

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

// Matches FilterBar's fixed row height: h-8 (32px) pill + 6px top/bottom padding.
const FILTER_ROW_HEIGHT = 44;
const FILTERS_HEIGHT = FILTER_ROW_HEIGHT * 2;

export default function LibraryScreen() {
  const router = useRouter();
  const books = useBookStore((state) => state.books);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('recent');

  const scrollY = useRef(new Animated.Value(0)).current;
  const clampedScroll = useRef(Animated.diffClamp(scrollY, 0, FILTERS_HEIGHT)).current;
  const filtersTranslateY = clampedScroll.interpolate({
    inputRange: [0, FILTERS_HEIGHT],
    outputRange: [0, -FILTERS_HEIGHT],
    extrapolate: 'clamp',
  });

  const displayed = books
    .filter((b) => filter === 'all' || b.status === filter)
    .sort((a, b) => {
      if (sort === 'az') return a.title.localeCompare(b.title);
      if (sort === 'za') return b.title.localeCompare(a.title);
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

  return (
    <View className="flex-1 bg-surface">
      <Animated.View
        className="absolute top-0 left-0 right-0 bg-surface"
        style={{ zIndex: 10, transform: [{ translateY: filtersTranslateY }] }}
      >
        <FilterBar filters={STATUS_FILTERS} active={filter} onSelect={setFilter} />
        <FilterBar filters={SORT_OPTIONS} active={sort} onSelect={setSort} />
      </Animated.View>
      <Animated.FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: FILTERS_HEIGHT + 12, paddingBottom: 12, gap: 10 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            variant="compact"
            showStatus
            onPress={() => router.push(`/book/${item.id}`)}
          />
        )}
      />
    </View>
  );
}
