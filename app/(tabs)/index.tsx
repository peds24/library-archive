import { useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import BookCard from '@/src/components/BookCard';
import { useBookStore } from '@/src/store/bookStore';

export default function CurrentlyReadingScreen() {
  const router = useRouter();
  const books = useBookStore((state) => state.books);
  const readingBooks = books.filter((b) => b.status === 'reading');

  return (
    <View className="flex-1 bg-surface">
      <FlatList
        data={readingBooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, gap: 12 }}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            variant="large"
            onPress={() => router.push(`/book/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-24">
            <Text className="text-ink-faint text-base">Nothing being read right now.</Text>
          </View>
        }
      />
    </View>
  );
}
