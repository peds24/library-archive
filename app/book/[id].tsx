import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useBookStore } from '@/src/store/bookStore';
import { colors } from '@/src/theme/colors';
import { BookStatus } from '@/src/types/book';

const STATUSES: { value: BookStatus; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'tbr', label: 'TBR' },
  { value: 'read', label: 'Read' },
  { value: 'shelved', label: 'Shelved' },
];

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
        {/* Cover */}
        <View className="items-center pt-8 pb-6 border-b border-border">
          <Image
            source={{ uri: book.coverImage }}
            className="w-36 h-52 rounded-xl bg-surface-2"
            resizeMode="cover"
          />
        </View>

        {/* Title & Author */}
        <View className="px-6 pt-5 pb-4 border-b border-border gap-2">
          <EditableTitleRow
            value={book.title}
            onSave={(v) => updateBook(book.id, { title: v })}
          />
          <EditableAuthorRow
            value={book.author}
            onSave={(v) => updateBook(book.id, { author: v })}
          />
        </View>

        {/* Stats */}
        <View className="px-6 py-4 border-b border-border flex-row gap-3">
          <StatTile
            label="pages"
            value={String(book.pages)}
            keyboardType="number-pad"
            onSave={(v) => {
              const n = parseInt(v, 10);
              if (n > 0) updateBook(book.id, { pages: n });
            }}
          />
          <StatTile
            label="published"
            value={book.publishedDate}
            onSave={(v) => updateBook(book.id, { publishedDate: v })}
          />
        </View>

        {/* Metadata */}
        <View className="px-6 py-4 gap-4 border-b border-border">
          <EditableRow
            label="Genre"
            value={book.genre}
            onSave={(v) => updateBook(book.id, { genre: v })}
          />
          <EditableRow
            label="Cover URL"
            value={book.coverImage}
            onSave={(v) => updateBook(book.id, { coverImage: v })}
          />
          <Row label="Added" value={new Date(book.dateAdded).toLocaleDateString()} />
        </View>

        {/* Status Picker */}
        <View className="px-6 pt-5">
          <Text className="text-ink-faint text-xs font-semibold uppercase tracking-widest mb-3">
            Status
          </Text>
          <View className="flex-row border border-border rounded-full overflow-hidden">
            {STATUSES.map((s, i) => {
              const isActive = book.status === s.value;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => updateStatus(book.id, s.value)}
                  className={`flex-1 h-9 items-center justify-center ${isActive ? 'bg-accent-container' : ''}`}
                  style={i < STATUSES.length - 1 ? { borderRightWidth: 1, borderRightColor: colors.border } : undefined}
                >
                  <Text className={`text-[11px] font-medium ${isActive ? 'text-accent-on-container' : 'text-ink-muted'}`}>
                    {isActive ? `✓ ${s.label}` : s.label}
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

function StatTile({
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
      <View className="flex-1 bg-accent-container rounded-2xl p-3 items-center">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          keyboardType={keyboardType}
          returnKeyType="done"
          onSubmitEditing={save}
          onBlur={save}
          autoFocus
          style={{ color: colors.accent.onContainer, fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 0 }}
        />
        <Text className="text-[11px] text-ink-muted mt-0.5">{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => { setDraft(value); setEditing(true); }}
      className="flex-1 bg-accent-container rounded-2xl p-3 items-center"
    >
      <Text
        className="text-xl font-bold text-accent-on-container"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text className="text-[11px] text-ink-muted mt-0.5">{label}</Text>
    </Pressable>
  );
}

function EditableTitleRow({ value, onSave }: { value: string; onSave: (v: string) => void }) {
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
      <TextInput
        value={draft}
        onChangeText={setDraft}
        returnKeyType="done"
        onSubmitEditing={save}
        onBlur={save}
        autoFocus
        style={{
          color: colors.ink.default,
          fontSize: 24,
          fontWeight: 'bold',
          lineHeight: 29,
          borderBottomWidth: 1.5,
          borderBottomColor: colors.accent.default,
          paddingBottom: 2,
        }}
      />
    );
  }

  return (
    <Pressable onPress={() => { setDraft(value); setEditing(true); }} className="flex-row items-center gap-1.5">
      <Text className="text-ink text-2xl font-bold leading-tight">{value}</Text>
      <SymbolView
        name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
        tintColor={colors.ink.faint}
        size={14}
      />
    </Pressable>
  );
}

function EditableAuthorRow({ value, onSave }: { value: string; onSave: (v: string) => void }) {
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
      <TextInput
        value={draft}
        onChangeText={setDraft}
        returnKeyType="done"
        onSubmitEditing={save}
        onBlur={save}
        autoFocus
        style={{
          color: colors.ink.muted,
          fontSize: 16,
          borderBottomWidth: 1.5,
          borderBottomColor: colors.accent.default,
          paddingBottom: 2,
        }}
      />
    );
  }

  return (
    <Pressable onPress={() => { setDraft(value); setEditing(true); }} className="flex-row items-center gap-1.5">
      <Text className="text-ink-muted text-base">{value}</Text>
      <SymbolView
        name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
        tintColor={colors.ink.faint}
        size={12}
      />
    </Pressable>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-ink-faint text-sm">{label}</Text>
      <Text className="text-ink text-sm font-medium">{value}</Text>
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
        <Text className="text-ink-faint text-sm">{label}</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          keyboardType={keyboardType}
          returnKeyType="done"
          onSubmitEditing={save}
          onBlur={save}
          autoFocus
          style={{
            color: colors.ink.muted,
            fontSize: 14,
            fontWeight: '500',
            textAlign: 'right',
            borderBottomWidth: 1.5,
            borderBottomColor: colors.accent.default,
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
      <Text className="text-ink-faint text-sm">{label}</Text>
      <View className="flex-row items-center gap-1.5">
        <Text className="text-ink text-sm font-medium">{value}</Text>
        <SymbolView
          name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
          tintColor={colors.ink.faint}
          size={12}
        />
      </View>
    </Pressable>
  );
}
