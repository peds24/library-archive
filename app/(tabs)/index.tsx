import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import BookCard from '@/src/components/BookCard';
import { useBookStore } from '@/src/store/bookStore';
import { Colors, FontSize, Spacing } from '@/src/theme';
import { CommonStyles } from '@/src/theme/common';

export default function CurrentlyReadingScreen() {
  const router = useRouter();
  const books = useBookStore((state) => state.books);
  const readingBooks = books.filter((b) => b.status === 'reading');

  return (
    <View style={CommonStyles.screen}>
      <FlatList
        data={readingBooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            variant="large"
            onPress={() => router.push(`/book/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nothing being read right now.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl, gap: Spacing.md },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 96 },
  emptyText: { color: Colors.ink.faint, fontSize: FontSize.base },
});
