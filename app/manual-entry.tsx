import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import M3TextField from '@/src/components/M3TextField';
import { useBookStore } from '@/src/store/bookStore';
import { Spacing } from '@/src/theme';
import { CommonStyles } from '@/src/theme/common';

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
        style={CommonStyles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <M3TextField
            label="ISBN"
            value={isbn}
            onChangeText={(v) => { setIsbn(v); setDuplicate(false); }}
            keyboardType="number-pad"
            placeholder="e.g. 9781534332560"
          />

          <M3TextField
            label="Title"
            required
            value={title}
            onChangeText={setTitle}
            placeholder="Book title"
            autoCapitalize="words"
          />

          <M3TextField
            label="Author"
            required
            value={author}
            onChangeText={setAuthor}
            placeholder="Author name"
            autoCapitalize="words"
          />

          <M3TextField
            label="Genre"
            value={genre}
            onChangeText={setGenre}
            placeholder="e.g. Science Fiction"
            autoCapitalize="words"
          />

          <M3TextField
            label="Pages"
            value={pages}
            onChangeText={setPages}
            keyboardType="number-pad"
            placeholder="e.g. 320"
          />

          <M3TextField
            label="Published Year"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            placeholder="e.g. 2024"
          />

          {duplicate && (
            <Text style={CommonStyles.warning}>
              A book with this ISBN is already in your library.
            </Text>
          )}

          <Pressable
            onPress={handleAdd}
            disabled={!canAdd}
            style={[CommonStyles.pillFilled, styles.submit, !canAdd && CommonStyles.pillDisabled]}
          >
            <Text style={[CommonStyles.pillFilledLabel, !canAdd && CommonStyles.pillDisabledLabel]}>
              Add to Library
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  form: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 48 },
  submit: { marginTop: Spacing.sm },
});
