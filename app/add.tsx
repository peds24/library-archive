import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { lookupByISBN } from '@/src/services/bookLookup';
import { useBookStore } from '@/src/store/bookStore';
import { Book } from '@/src/types/book';

type Phase = 'input' | 'loading' | 'preview' | 'not-found' | 'error';

function cleanISBN(raw: string) {
  return raw.replace(/[-\s]/g, '');
}

export default function AddBookScreen() {
  const router = useRouter();
  const books = useBookStore((s) => s.books);
  const addBook = useBookStore((s) => s.addBook);

  const [isbn, setIsbn] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [preview, setPreview] = useState<Book | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  async function handleSearch() {
    const cleaned = cleanISBN(isbn);
    if (cleaned.length !== 10 && cleaned.length !== 13) return;
    setPhase('loading');
    setIsDuplicate(false);
    try {
      const book = await lookupByISBN(cleaned);
      if (!book) {
        setPhase('not-found');
      } else {
        setPreview(book);
        setPhase('preview');
      }
    } catch {
      setPhase('error');
    }
  }

  function handleAdd() {
    if (!preview) return;
    if (books.some((b) => b.id === preview.id)) {
      setIsDuplicate(true);
      return;
    }
    addBook(preview);
    router.back();
  }

  function handleReset() {
    setIsbn('');
    setPhase('input');
    setPreview(null);
    setIsDuplicate(false);
  }

  const isbnReady = cleanISBN(isbn).length === 10 || cleanISBN(isbn).length === 13;

  return (
    <>
      <Stack.Screen options={{ title: 'Add Book' }} />
      <KeyboardAvoidingView
        className="flex-1 bg-stone-50"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ISBN input — always visible */}
        <View className="px-5 pt-5 pb-4 gap-3 bg-white border-b border-stone-200">
          <TextInput
            className="bg-stone-100 rounded-xl px-4 py-3 text-stone-900 text-base"
            placeholder="Enter ISBN (e.g. 9780441172719)"
            placeholderTextColor="#a8a29e"
            value={isbn}
            onChangeText={setIsbn}
            keyboardType="number-pad"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            editable={phase !== 'loading'}
          />
          <Pressable
            onPress={handleSearch}
            disabled={phase === 'loading' || !isbnReady}
            className={`py-3 rounded-xl items-center ${phase === 'loading' || !isbnReady ? 'bg-stone-200' : 'bg-accent'}`}
          >
            <Text className={`font-semibold text-base ${phase === 'loading' || !isbnReady ? 'text-stone-400' : 'text-white'}`}>
              {phase === 'loading' ? 'Searching…' : 'Search'}
            </Text>
          </Pressable>

          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-px bg-stone-200" />
            <Text className="text-stone-400 text-xs">or</Text>
            <View className="flex-1 h-px bg-stone-200" />
          </View>

          <Pressable
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPress={() => router.push('/scan' as any)}
            className="py-3 rounded-xl items-center border border-stone-200"
          >
            <Text className="text-stone-600 font-semibold text-base">Scan Barcode</Text>
          </Pressable>
        </View>

        {/* Loading */}
        {phase === 'loading' && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0061a4" />
          </View>
        )}

        {/* Not found */}
        {phase === 'not-found' && (
          <View className="flex-1 items-center justify-center px-8 gap-4">
            <Text className="text-stone-500 text-base text-center">
              No book found for that ISBN.{'\n'}You can add it manually instead.
            </Text>
            <Pressable
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onPress={() => router.push({ pathname: '/manual-entry' as any, params: { isbn: cleanISBN(isbn) } })}
              className="bg-accent px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Add Manually</Text>
            </Pressable>
            <Pressable onPress={handleReset}>
              <Text className="text-stone-400 font-medium">Try another ISBN</Text>
            </Pressable>
          </View>
        )}

        {/* Network error */}
        {phase === 'error' && (
          <View className="flex-1 items-center justify-center px-8 gap-4">
            <Text className="text-stone-500 text-base text-center">
              Couldn't reach Open Library.{'\n'}Check your connection and try again.
            </Text>
            <Pressable onPress={() => setPhase('input')}>
              <Text className="text-accent font-semibold">Try again</Text>
            </Pressable>
          </View>
        )}

        {/* Preview */}
        {phase === 'preview' && preview && (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center px-6 py-8 gap-4">
              {preview.coverImage ? (
                <Image
                  source={{ uri: preview.coverImage }}
                  className="w-32 h-48 rounded-xl bg-stone-100"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-32 h-48 rounded-xl bg-stone-100 items-center justify-center">
                  <Text className="text-stone-300 text-sm">No cover</Text>
                </View>
              )}
              <View className="items-center gap-1 w-full">
                <Text className="text-stone-900 text-xl font-bold text-center">{preview.title}</Text>
                <Text className="text-stone-500 text-base">{preview.author}</Text>
                <Text className="text-stone-400 text-sm mt-1">
                  {preview.genre} · {preview.pages} pages · {preview.publishedDate.slice(0, 4)}
                </Text>
              </View>
            </View>

            <View className="px-5 gap-3">
              {isDuplicate && (
                <Text className="text-red-500 text-sm text-center">
                  This book is already in your library.
                </Text>
              )}
              <Pressable onPress={handleAdd} className="bg-accent py-3 rounded-xl items-center">
                <Text className="text-white font-semibold text-base">Add to Library</Text>
              </Pressable>
              <Pressable onPress={handleReset} className="py-3 items-center">
                <Text className="text-stone-400 font-medium">Search another ISBN</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}
