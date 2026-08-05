import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useBookStore } from '@/src/store/bookStore';

export default function ManualEntryScreen() {
  const { isbn: isbnParam } = useLocalSearchParams<{ isbn?: string }>();
  const router = useRouter();
  const addBook = useBookStore((s) => s.addBook);
  const books = useBookStore((s) => s.books);

  const [isbn, setIsbn] = useState(isbnParam ?? '');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [pages, setPages] = useState('');
  const [year, setYear] = useState('');
  const [duplicate, setDuplicate] = useState(false);

  const canAdd = title.trim().length > 0 && author.trim().length > 0;

  function handleAdd() {
    if (!canAdd) return;

    const resolvedId = isbn.trim() || `manual-${Date.now()}`;

    if (books.some((b) => b.id === resolvedId)) {
      setDuplicate(true);
      return;
    }

    addBook({
      id: resolvedId,
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim() || 'Uncategorized',
      pages: parseInt(pages, 10) || 0,
      publishedDate: year.trim(),
      coverImage: '',
      status: 'shelved',
      dateAdded: new Date().toISOString(),
    });

    router.dismissAll();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Manually' }} />
      <KeyboardAvoidingView
        className="flex-1 bg-stone-50"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          <FormField
            label="ISBN"
            value={isbn}
            onChangeText={(v) => { setIsbn(v); setDuplicate(false); }}
            keyboardType="number-pad"
            placeholder="e.g. 9781534332560"
          />

          <FormField
            label="Title"
            required
            value={title}
            onChangeText={setTitle}
            placeholder="Book title"
            autoCapitalize="words"
          />

          <FormField
            label="Author"
            required
            value={author}
            onChangeText={setAuthor}
            placeholder="Author name"
            autoCapitalize="words"
          />

          <FormField
            label="Genre"
            value={genre}
            onChangeText={setGenre}
            placeholder="e.g. Science Fiction"
            autoCapitalize="words"
          />

          <FormField
            label="Pages"
            value={pages}
            onChangeText={setPages}
            keyboardType="number-pad"
            placeholder="e.g. 320"
          />

          <FormField
            label="Published Year"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            placeholder="e.g. 2024"
          />

          {duplicate && (
            <Text className="text-red-500 text-sm text-center">
              A book with this ISBN is already in your library.
            </Text>
          )}

          <Pressable
            onPress={handleAdd}
            disabled={!canAdd}
            className={`py-3 rounded-xl items-center mt-2 ${canAdd ? 'bg-amber-700' : 'bg-stone-200'}`}
          >
            <Text className={`font-semibold text-base ${canAdd ? 'text-white' : 'text-stone-400'}`}>
              Add to Library
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function FormField({
  label,
  required,
  ...inputProps
}: { label: string; required?: boolean } & TextInputProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-stone-500 text-xs font-semibold uppercase tracking-widest">
        {label}
        {required && <Text className="text-red-400"> *</Text>}
      </Text>
      <TextInput
        className="bg-white rounded-xl px-4 py-3 text-stone-900 text-base border border-stone-200"
        placeholderTextColor="#a8a29e"
        returnKeyType="next"
        {...inputProps}
      />
    </View>
  );
}
