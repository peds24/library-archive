import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
  const updateBook = useBookStore((state) => state.updateBook);
  const deleteBook = useBookStore((state) => state.deleteBook);

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50">
        <Text className="text-stone-400">Book not found.</Text>
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
        <View className="px-6 py-4 gap-4 border-b border-stone-100">
          <EditableRow
            label="Genre"
            value={book.genre}
            onSave={(v) => updateBook(book.id, { genre: v })}
          />
          <EditableRow
            label="Pages"
            value={String(book.pages)}
            keyboardType="number-pad"
            onSave={(v) => {
              const n = parseInt(v, 10);
              if (n > 0) updateBook(book.id, { pages: n });
            }}
          />
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
                  className={`px-4 py-2 rounded-full ${isActive ? STATUS_ACTIVE_BG[s.value] : 'bg-stone-100'}`}
                >
                  <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-stone-500'}`}>
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

function EditableRow({
  label,
  value,
  onSave,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  keyboardType?: 'default' | 'number-pad';
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function save() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else if (!trimmed) setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <View className="flex-row justify-between items-center">
        <Text className="text-stone-400 text-sm">{label}</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          keyboardType={keyboardType}
          returnKeyType="done"
          onSubmitEditing={save}
          onBlur={save}
          autoFocus
          style={{
            color: '#44403c',
            fontSize: 14,
            fontWeight: '500',
            textAlign: 'right',
            borderBottomWidth: 1.5,
            borderBottomColor: '#b45309',
            minWidth: 80,
            paddingBottom: 2,
          }}
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => { setDraft(value); setEditing(true); }}
      className="flex-row justify-between items-center"
    >
      <Text className="text-stone-400 text-sm">{label}</Text>
      <View className="flex-row items-center gap-1.5">
        <Text className="text-stone-700 text-sm font-medium">{value}</Text>
        <SymbolView
          name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
          tintColor="#d4a058"
          size={12}
        />
      </View>
    </Pressable>
  );
}
