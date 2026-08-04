import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useBookStore } from '@/src/store/bookStore';
import { BookStatus } from '@/src/types/book';

const STATUSES: { value: BookStatus; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'tbr', label: 'TBR' },
  { value: 'read', label: 'Read' },
  { value: 'shelved', label: 'Shelved' },
];

const STATUS_ACTIVE_BG: Record<BookStatus, string> = {
  reading: 'bg-blue-600',
  tbr: 'bg-amber-600',
  read: 'bg-green-600',
  shelved: 'bg-stone-500',
};

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const book = useBookStore((state) => state.books.find((b) => b.id === id));
  const updateStatus = useBookStore((state) => state.updateStatus);

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <Text className="text-stone-400">Book not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: book.title, headerBackTitle: 'Back' }} />
      <ScrollView className="flex-1 bg-stone-50" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Cover */}
        <View className="items-center bg-white pt-8 pb-6 border-b border-stone-100">
          <Image
            source={{ uri: book.coverImage }}
            className="w-36 h-52 rounded-xl bg-stone-100"
            resizeMode="cover"
          />
        </View>

        {/* Title & Author */}
        <View className="px-6 pt-5 pb-4 border-b border-stone-100">
          <Text className="text-stone-900 text-2xl font-bold leading-tight">{book.title}</Text>
          <Text className="text-stone-500 text-base mt-1">{book.author}</Text>
        </View>

        {/* Metadata */}
        <View className="px-6 py-4 gap-3 border-b border-stone-100">
          <Row label="Genre" value={book.genre} />
          <Row label="Pages" value={String(book.pages)} />
          <Row label="Published" value={book.publishedDate.slice(0, 4)} />
          <Row label="Added" value={new Date(book.dateAdded).toLocaleDateString()} />
        </View>

        {/* Status Picker */}
        <View className="px-6 pt-5">
          <Text className="text-stone-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Status
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {STATUSES.map((s) => {
              const isActive = book.status === s.value;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => updateStatus(book.id, s.value)}
                  className={`px-4 py-2 rounded-full ${
                    isActive ? STATUS_ACTIVE_BG[s.value] : 'bg-stone-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-stone-500'}`}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-stone-400 text-sm">{label}</Text>
      <Text className="text-stone-700 text-sm font-medium">{value}</Text>
    </View>
  );
}
