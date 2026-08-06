import { useNavigation, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useLayoutEffect, useRef, useState } from 'react';
import { Animated, Pressable, TextInput, View } from 'react-native';
import BookCard from '@/src/components/BookCard';
import FilterBar from '@/src/components/FilterBar';
import { useBookStore } from '@/src/store/bookStore';
import { colors } from '@/src/theme/colors';
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
  const navigation = useNavigation();
  const books = useBookStore((state) => state.books);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('recent');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Header icons live here (not in (tabs)/_layout.tsx) so the search toggle
  // can react to this screen's own state.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row items-center gap-3" style={{ marginRight: 16 }}>
          <Pressable
            onPress={() => {
              if (searchOpen) setQuery('');
              setSearchOpen((v) => !v);
            }}
            hitSlop={8}
            className="w-9 h-9 items-center justify-center rounded-full bg-accent-container"
          >
            <SymbolView
              name={{
                ios: searchOpen ? 'xmark' : 'magnifyingglass',
                android: searchOpen ? 'close' : 'search',
                web: searchOpen ? 'close' : 'search',
              }}
              tintColor={colors.accent.onContainer}
              size={18}
            />
          </Pressable>
          <Pressable
            onPress={() => router.push('/add')}
            hitSlop={8}
            className="w-9 h-9 items-center justify-center rounded-full bg-accent-container"
          >
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              tintColor={colors.accent.onContainer}
              size={22}
            />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, searchOpen]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const clampedScroll = useRef(Animated.diffClamp(scrollY, 0, FILTERS_HEIGHT)).current;
  const filtersTranslateY = clampedScroll.interpolate({
    inputRange: [0, FILTERS_HEIGHT],
    outputRange: [0, -FILTERS_HEIGHT],
    extrapolate: 'clamp',
  });

  const q = query.trim().toLowerCase();
  const displayed = books
    .filter((b) => filter === 'all' || b.status === filter)
    .filter((b) => !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    .sort((a, b) => {
      if (sort === 'az') return a.title.localeCompare(b.title);
      if (sort === 'za') return b.title.localeCompare(a.title);
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

  return (
    <View className="flex-1 bg-surface">
      {searchOpen && (
        <View className="flex-row items-center gap-2 mx-4 mt-3 mb-1 px-3 h-11 rounded-full bg-surface-2 border-2 border-accent">
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            tintColor={colors.accent.default}
            size={16}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by title or author"
            placeholderTextColor={colors.ink.faint}
            autoFocus
            returnKeyType="search"
            className="flex-1 text-ink text-base p-0"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <SymbolView
                name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                tintColor={colors.ink.faint}
                size={16}
              />
            </Pressable>
          )}
        </View>
      )}
      <View className="flex-1">
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: colors.surface.default,
            transform: [{ translateY: filtersTranslateY }],
          }}
        >
          <FilterBar filters={STATUS_FILTERS} active={filter} onSelect={setFilter} />
          <FilterBar filters={SORT_OPTIONS} active={sort} onSelect={setSort} />
        </Animated.View>
        <Animated.FlatList
          data={displayed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: FILTERS_HEIGHT, paddingBottom: 12, gap: 10 }}
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
    </View>
  );
}
