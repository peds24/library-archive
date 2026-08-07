import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import BookEditor from '@/src/components/BookEditor';
import { useBookStore } from '@/src/store/bookStore';
import { Book } from '@/src/types/book';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const book = useBookStore((state) => state.books.find((b) => b.id === id));
  const updateStatus = useBookStore((state) => state.updateStatus);
  const updateBook = useBookStore((state) => state.updateBook);
  const deleteBook = useBookStore((state) => state.deleteBook);

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-ink-faint">Book not found.</Text>
      </View>
    );
  }

  function handleDelete() {
    Alert.alert(
      'Remove Book',
      `Remove "${book!.title}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            deleteBook(book!.id);
            router.back();
          },
        },
      ]
    );
  }

  // Status has its own store action (and its own DB column write), so it's split
  // back out of the generic field updates here. `id` and `dateAdded` are never
  // editable, so they're dropped rather than forwarded.
  function handleChange(updates: Partial<Book>) {
    const { status, id: _id, dateAdded: _dateAdded, ...fields } = updates;
    if (status) updateStatus(book!.id, status);
    if (Object.keys(fields).length > 0) updateBook(book!.id, fields);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: book.title,
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable onPress={handleDelete} style={{ marginRight: 16 }} hitSlop={8}>
              <SymbolView
                name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                tintColor="#ef4444"
                size={22}
              />
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingBottom: 40 }}>
        <BookEditor book={book} onChange={handleChange} />
      </ScrollView>
    </>
  );
}
