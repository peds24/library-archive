import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BookEditor from '@/src/components/BookEditor';
import { useBookStore } from '@/src/store/bookStore';
import { Colors, FontSize, Radius, Spacing } from '@/src/theme';
import { CommonStyles } from '@/src/theme/common';
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
        <View style={[CommonStyles.screenCentered, styles.errorScreen]}>
          <Text style={styles.errorText}>Something went wrong reading that scan.</Text>
          <Pressable onPress={() => router.back()} style={styles.inlinePill}>
            <Text style={CommonStyles.pillFilledLabel}>Back to Scanner</Text>
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
      <ScrollView style={CommonStyles.screen} contentContainerStyle={styles.content}>
        <View style={styles.hintSection}>
          <Text style={styles.hint}>Check the details before adding — tap any field to edit it.</Text>
        </View>

        <BookEditor book={draft} onChange={handleChange} showDateAdded={false} />

        <View style={styles.actions}>
          {isDuplicate && (
            <Text style={CommonStyles.warning}>This book is already in your library.</Text>
          )}

          <Pressable
            onPress={handleAddAndFinish}
            disabled={isDuplicate}
            style={[CommonStyles.pillFilled, isDuplicate && CommonStyles.pillDisabled]}
          >
            <Text style={[CommonStyles.pillFilledLabel, isDuplicate && CommonStyles.pillDisabledLabel]}>
              Add to Library
            </Text>
          </Pressable>

          <Pressable
            onPress={isDuplicate ? () => router.back() : handleAddAndScanAnother}
            style={CommonStyles.pillOutline}
          >
            <Text style={CommonStyles.pillOutlineLabel}>
              {isDuplicate ? 'Scan Another' : 'Add & Scan Another'}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={CommonStyles.textButton}>
            <Text style={CommonStyles.textButtonLabel}>Discard — wrong book</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  hintSection: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg },
  hint: { color: Colors.ink.faint, fontSize: FontSize.sm, textAlign: 'center' },
  actions: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xxxl, gap: Spacing.md },

  errorScreen: { paddingHorizontal: Spacing.xxxl, gap: Spacing.lg },
  errorText: { color: Colors.ink.muted, fontSize: FontSize.base, textAlign: 'center' },
  // A hug-width filled pill, unlike the full-width CommonStyles.pillFilled.
  inlinePill: {
    backgroundColor: Colors.accent.default,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
});
