import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import M3TextField from '@/src/components/M3TextField';
import { lookupByISBN } from '@/src/services/bookLookup';
import { useBookStore } from '@/src/store/bookStore';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import { CommonStyles } from '@/src/theme/common';
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
  const searchDisabled = phase === 'loading' || !isbnReady;

  return (
    <>
      <Stack.Screen options={{ title: 'Add Book' }} />
      <KeyboardAvoidingView
        style={CommonStyles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ISBN input — always visible */}
        <View style={styles.inputSection}>
          <M3TextField
            label="ISBN"
            placeholder="e.g. 9780441172719"
            value={isbn}
            onChangeText={setIsbn}
            keyboardType="number-pad"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            editable={phase !== 'loading'}
          />
          <Pressable
            onPress={handleSearch}
            disabled={searchDisabled}
            style={[CommonStyles.pillFilled, searchDisabled && CommonStyles.pillDisabled]}
          >
            <Text style={[CommonStyles.pillFilledLabel, searchDisabled && CommonStyles.pillDisabledLabel]}>
              {phase === 'loading' ? 'Searching…' : 'Search'}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerRule} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerRule} />
          </View>

          <Pressable
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPress={() => router.push('/scan' as any)}
            style={CommonStyles.pillOutline}
          >
            <Text style={CommonStyles.pillOutlineLabel}>Scan Barcode</Text>
          </Pressable>
        </View>

        {/* Loading */}
        {phase === 'loading' && (
          <View style={styles.centeredFill}>
            <ActivityIndicator size="large" color={Colors.accent.default} />
          </View>
        )}

        {/* Not found */}
        {phase === 'not-found' && (
          <View style={[styles.centeredFill, styles.message]}>
            <Text style={styles.messageText}>
              No book found for that ISBN.{'\n'}You can add it manually instead.
            </Text>
            <Pressable
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onPress={() => router.push({ pathname: '/manual-entry' as any, params: { isbn: cleanISBN(isbn) } })}
              style={styles.inlinePill}
            >
              <Text style={styles.inlinePillLabel}>Add Manually</Text>
            </Pressable>
            <Pressable onPress={handleReset}>
              <Text style={CommonStyles.textButtonLabel}>Try another ISBN</Text>
            </Pressable>
          </View>
        )}

        {/* Network error */}
        {phase === 'error' && (
          <View style={[styles.centeredFill, styles.message]}>
            <Text style={styles.messageText}>
              Couldn't reach the book databases.{'\n'}Check your connection and try again.
            </Text>
            <Pressable onPress={() => setPhase('input')}>
              <Text style={styles.retryLabel}>Try again</Text>
            </Pressable>
          </View>
        )}

        {/* Preview */}
        {phase === 'preview' && preview && (
          <ScrollView contentContainerStyle={styles.previewContent} keyboardShouldPersistTaps="handled">
            <View style={styles.previewHeader}>
              {preview.coverImage ? (
                <Image source={{ uri: preview.coverImage }} style={styles.cover} resizeMode="cover" />
              ) : (
                <View style={[styles.cover, styles.coverEmpty]}>
                  <Text style={styles.coverEmptyText}>No cover</Text>
                </View>
              )}
              <View style={styles.previewText}>
                <Text style={styles.previewTitle}>{preview.title}</Text>
                <Text style={styles.previewAuthor}>{preview.author}</Text>
                <Text style={styles.previewMeta}>
                  {preview.genre} · {preview.pages} pages · {preview.publishedDate.slice(0, 4)}
                </Text>
              </View>
            </View>

            <View style={styles.previewActions}>
              {isDuplicate && (
                <Text style={CommonStyles.warning}>This book is already in your library.</Text>
              )}
              <Pressable onPress={handleAdd} style={CommonStyles.pillFilled}>
                <Text style={CommonStyles.pillFilledLabel}>Add to Library</Text>
              </Pressable>
              <Pressable onPress={handleReset} style={styles.resetButton}>
                <Text style={CommonStyles.textButtonLabel}>Search another ISBN</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  inputSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerRule: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerLabel: { color: Colors.ink.faint, fontSize: FontSize.xs },

  centeredFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  message: { paddingHorizontal: Spacing.xxxl, gap: Spacing.lg },
  messageText: { color: Colors.ink.muted, fontSize: FontSize.base, textAlign: 'center' },
  retryLabel: { color: Colors.accent.default, fontWeight: FontWeight.semibold },

  // A hug-width filled pill, unlike the full-width CommonStyles.pillFilled.
  inlinePill: {
    backgroundColor: Colors.accent.default,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  inlinePillLabel: { color: Colors.accent.on, fontWeight: FontWeight.semibold },

  previewContent: { paddingBottom: 40 },
  previewHeader: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxxl,
    gap: Spacing.lg,
  },
  cover: {
    width: 128,
    height: 192,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface.raised,
  },
  coverEmpty: { alignItems: 'center', justifyContent: 'center' },
  coverEmptyText: { color: Colors.ink.faint, fontSize: FontSize.sm },
  previewText: { alignItems: 'center', gap: Spacing.xs, width: '100%' },
  previewTitle: {
    color: Colors.ink.default,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  previewAuthor: { color: Colors.ink.muted, fontSize: FontSize.base },
  previewMeta: { color: Colors.ink.faint, fontSize: FontSize.sm, marginTop: Spacing.xs },
  previewActions: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  resetButton: { paddingVertical: Spacing.md, alignItems: 'center' },
});
