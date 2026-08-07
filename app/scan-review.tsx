import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import BookEditor from '@/src/components/BookEditor';
import { useBookStore } from '@/src/store/bookStore';
import { Book } from '@/src/types/book';

/**
 * Step 2 of the scan flow. The scanner hands a looked-up book here as a JSON param
 * and adds nothing to the library itself — a misread barcode or a wrong match dies
 * on this screen instead of landing in the collection. Edits are held in local draft
 * state and only reach the store when the user commits, via either action below.
 */
export default function ScanReviewScreen() {
  const { book: bookParam } = useLocalSearchParams<{ book: string }>();
  const router = useRouter();
  const books = useBookStore((s) => s.books);
  const addBook = useBookStore((s) => s.addBook);

  const [draft, setDraft] = useState<Book | null>(() => {
    try {
      return JSON.parse(bookParam) as Book;
    } catch {
      return null;
    }
  });

  if (!draft) {
    return (
      <>
        <Stack.Screen options={{ title: 'Confirm Book' }} />
        <View className="flex-1 items-center justify-center bg-surface px-8 gap-4">
          <Text className="text-ink-muted text-base text-center">
            Something went wrong reading that scan.
          </Text>
          <Pressable onPress={() => router.back()} className="bg-accent px-6 py-3 rounded-full">
            <Text className="text-accent-on font-semibold">Back to Scanner</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const isDuplicate = books.some((b) => b.id === draft.id);

  function handleChange(updates: Partial<Book>) {
    setDraft((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  // Both actions commit — the only difference is where the user lands afterwards.
  // "Scan another" pops back to the still-mounted scanner, which resets itself to
  // its scanning phase on focus; "Add to Library" tears the whole add flow down.
  function commit() {
    if (!draft || isDuplicate) return false;
    addBook(draft);
    return true;
  }

  function handleAddAndFinish() {
    if (commit()) router.dismissAll();
  }

  function handleAddAndScanAnother() {
    if (commit()) router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Confirm Book' }} />
      <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 pt-4">
          <Text className="text-ink-faint text-sm text-center">
            Check the details before adding — tap any field to edit it.
          </Text>
        </View>

        <BookEditor book={draft} onChange={handleChange} showDateAdded={false} />

        <View className="px-6 pt-8 gap-3">
          {isDuplicate && (
            <Text className="text-red-400 text-sm text-center">
              This book is already in your library.
            </Text>
          )}

          <Pressable
            onPress={handleAddAndFinish}
            disabled={isDuplicate}
            className={`py-3 rounded-full items-center ${isDuplicate ? 'bg-surface-2' : 'bg-accent'}`}
          >
            <Text className={`font-semibold text-base ${isDuplicate ? 'text-ink-faint' : 'text-accent-on'}`}>
              Add to Library
            </Text>
          </Pressable>

          <Pressable
            onPress={isDuplicate ? () => router.back() : handleAddAndScanAnother}
            className="py-3 rounded-full items-center border border-border"
          >
            <Text className="text-accent font-semibold text-base">
              {isDuplicate ? 'Scan Another' : 'Add & Scan Another'}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()} className="py-2 items-center">
            <Text className="text-ink-faint font-medium">Discard — wrong book</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
