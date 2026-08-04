import { FlatList, Text, View } from 'react-native';
import BookCard from '@/src/components/BookCard';
import { Book } from '@/src/types/book';
import rawBooks from '@/src/data/mock-books.json';

const books = rawBooks as Book[];
const readingBooks = books.filter((b) => b.status === 'reading');

export default function CurrentlyReadingScreen() {
  return (
    <View className="flex-1 bg-stone-50">
      <FlatList
        data={readingBooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, gap: 12 }}
        renderItem={({ item }) => <BookCard book={item} variant="large" />}
        ListEmptyComponent={
          <View className="items-center justify-center py-24">
            <Text className="text-stone-400 text-base">Nothing being read right now.</Text>
          </View>
        }
      />
    </View>
  );
}
