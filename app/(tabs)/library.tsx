import { useNavigation, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useLayoutEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, TextInput, View } from 'react-native';
import BookCard from '@/src/components/BookCard';
import FilterBar from '@/src/components/FilterBar';
import { useBookStore } from '@/src/store/bookStore';
import { Colors, FontSize, Radius, Spacing } from '@/src/theme';
import { CommonStyles } from '@/src/theme/common';
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

// Matches FilterBar's fixed row: a 36px pill plus 6px of padding top and bottom.
const FILTER_ROW_HEIGHT = 48;
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
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              if (searchOpen) setQuery('');
              setSearchOpen((v) => !v);
            }}
            hitSlop={8}
            style={styles.headerButton}
          >
            <SymbolView
              name={{
                ios: searchOpen ? 'xmark' : 'magnifyingglass',
                android: searchOpen ? 'close' : 'search',
                web: searchOpen ? 'close' : 'search',
              }}
              tintColor={Colors.accent.onContainer}
              size={18}
            />
          </Pressable>
          <Pressable onPress={() => router.push('/add')} hitSlop={8} style={styles.headerButton}>
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              tintColor={Colors.accent.onContainer}
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
    <View style={CommonStyles.screen}>
      {searchOpen && (
        <View style={styles.searchBar}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            tintColor={Colors.accent.default}
            size={16}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by title or author"
            placeholderTextColor={Colors.ink.faint}
            autoFocus
            returnKeyType="search"
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <SymbolView
                name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                tintColor={Colors.ink.faint}
                size={16}
              />
            </Pressable>
          )}
        </View>
      )}
      <View style={styles.listArea}>
        <Animated.View
          style={[styles.filters, { transform: [{ translateY: filtersTranslateY }] }]}
        >
          <FilterBar filters={STATUS_FILTERS} active={filter} onSelect={setFilter} />
          <FilterBar filters={SORT_OPTIONS} active={sort} onSelect={setSort} />
        </Animated.View>
        <Animated.FlatList
          data={displayed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
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

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginRight: Spacing.lg,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.accent.container,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface.raised,
    borderWidth: 2,
    borderColor: Colors.accent.default,
  },
  searchInput: { flex: 1, color: Colors.ink.default, fontSize: FontSize.base, padding: 0 },

  listArea: { flex: 1 },
  filters: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.surface.default,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: FILTERS_HEIGHT,
    paddingBottom: Spacing.md,
    gap: 10,
  },
});
