import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, FontSize, FontWeight, LetterSpacing, Radius, Spacing } from '@/src/theme';
import { Book, BookStatus } from '@/src/types/book';

const STATUSES: { value: BookStatus; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'tbr', label: 'TBR' },
  { value: 'read', label: 'Read' },
  { value: 'shelved', label: 'Shelved' },
];

const PENCIL = { ios: 'pencil', android: 'edit', web: 'edit' } as const;

/**
 * The editable "book view" — cover, tap-to-edit fields, status picker.
 *
 * Deliberately has no idea whether the book it renders is saved or not: it takes a
 * Book and reports edits through `onChange`. `app/book/[id].tsx` wires that to the
 * store (edits persist immediately); `app/scan-review.tsx` wires it to local draft
 * state (edits stay uncommitted until the user confirms). One component means a
 * scanned book is reviewed on exactly the same screen it will later be edited on.
 */
export default function BookEditor({
  book,
  onChange,
  showDateAdded = true,
}: {
  book: Book;
  onChange: (updates: Partial<Book>) => void;
  showDateAdded?: boolean;
}) {
  return (
    <>
      {/* Cover */}
      <View style={styles.coverSection}>
        {book.coverImage ? (
          <Image source={{ uri: book.coverImage }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.coverEmpty]}>
            <Text style={styles.coverEmptyText}>No cover</Text>
          </View>
        )}
      </View>

      {/* Title & Author */}
      <View style={styles.headingSection}>
        <EditableTitleRow value={book.title} onSave={(v) => onChange({ title: v })} />
        <EditableAuthorRow value={book.author} onSave={(v) => onChange({ author: v })} />
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <StatTile
          label="pages"
          value={String(book.pages)}
          keyboardType="number-pad"
          onSave={(v) => {
            const n = parseInt(v, 10);
            if (n > 0) onChange({ pages: n });
          }}
        />
        <StatTile
          label="published"
          value={book.publishedDate}
          onSave={(v) => onChange({ publishedDate: v })}
        />
      </View>

      {/* Metadata */}
      <View style={styles.metaSection}>
        <EditableRow label="Genre" value={book.genre} onSave={(v) => onChange({ genre: v })} />
        <EditableRow
          label="Cover URL"
          value={book.coverImage}
          onSave={(v) => onChange({ coverImage: v })}
        />
        {showDateAdded && (
          <Row label="Added" value={new Date(book.dateAdded).toLocaleDateString()} />
        )}
      </View>

      {/* Status Picker */}
      <View style={styles.statusSection}>
        <Text style={styles.statusHeading}>Status</Text>
        <View style={styles.statusGroup}>
          {STATUSES.map((s, i) => {
            const isActive = book.status === s.value;
            return (
              <Pressable
                key={s.value}
                onPress={() => onChange({ status: s.value })}
                style={[
                  styles.statusOption,
                  isActive && styles.statusOptionActive,
                  i < STATUSES.length - 1 && styles.statusDivider,
                ]}
              >
                <Text style={[styles.statusLabel, isActive ? styles.statusLabelActive : styles.statusLabelIdle]}>
                  {isActive ? `✓ ${s.label}` : s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
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
      <View style={styles.statTile}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          keyboardType={keyboardType}
          returnKeyType="done"
          onSubmitEditing={save}
          onBlur={save}
          autoFocus
          style={styles.statTileInput}
        />
        <Text style={styles.statTileLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={() => { setDraft(value); setEditing(true); }} style={styles.statTile}>
      <Text style={styles.statTileValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statTileLabel}>{label}</Text>
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
        style={styles.titleInput}
      />
    );
  }

  return (
    <Pressable onPress={() => { setDraft(value); setEditing(true); }} style={styles.tapRow}>
      <Text style={styles.title}>{value}</Text>
      <SymbolView name={PENCIL} tintColor={Colors.ink.faint} size={14} />
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
        style={styles.authorInput}
      />
    );
  }

  return (
    <Pressable onPress={() => { setDraft(value); setEditing(true); }} style={styles.tapRow}>
      <Text style={styles.author}>{value}</Text>
      <SymbolView name={PENCIL} tintColor={Colors.ink.faint} size={12} />
    </Pressable>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
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
      <View style={styles.rowCentered}>
        <Text style={styles.rowLabel}>{label}</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          keyboardType={keyboardType}
          returnKeyType="done"
          onSubmitEditing={save}
          onBlur={save}
          autoFocus
          style={styles.rowInput}
        />
      </View>
    );
  }

  return (
    <Pressable onPress={() => { setDraft(value); setEditing(true); }} style={styles.rowCentered}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.tapRow}>
        <Text style={styles.rowValue}>{value}</Text>
        <SymbolView name={PENCIL} tintColor={Colors.ink.faint} size={12} />
      </View>
    </Pressable>
  );
}

// The accent underline every inline editor grows while focused, so the four of
// them cannot drift apart.
const editingUnderline = {
  borderBottomWidth: 1.5,
  borderBottomColor: Colors.accent.default,
  paddingBottom: 2,
} as const;

const styles = StyleSheet.create({
  coverSection: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cover: {
    width: 144,
    height: 208,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface.raised,
  },
  coverEmpty: { alignItems: 'center', justifyContent: 'center' },
  coverEmptyText: { color: Colors.ink.faint, fontSize: FontSize.sm },

  headingSection: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  tapRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: {
    color: Colors.ink.default,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    lineHeight: 29,
  },
  titleInput: {
    ...editingUnderline,
    color: Colors.ink.default,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    lineHeight: 29,
  },
  author: { color: Colors.ink.muted, fontSize: FontSize.base },
  authorInput: { ...editingUnderline, color: Colors.ink.muted, fontSize: FontSize.base },

  statsSection: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.accent.container,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statTileValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.accent.onContainer,
  },
  statTileInput: {
    color: Colors.accent.onContainer,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    padding: 0,
  },
  statTileLabel: { fontSize: FontSize.micro, color: Colors.ink.muted, marginTop: Spacing.xxs },

  metaSection: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowCentered: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: Colors.ink.faint, fontSize: FontSize.sm },
  rowValue: { color: Colors.ink.default, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  rowInput: {
    ...editingUnderline,
    color: Colors.ink.muted,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
    minWidth: 80,
  },

  statusSection: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xl },
  statusHeading: {
    color: Colors.ink.faint,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.widest,
    marginBottom: Spacing.md,
  },
  statusGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  statusOption: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' },
  statusOptionActive: { backgroundColor: Colors.accent.container },
  statusDivider: { borderRightWidth: 1, borderRightColor: Colors.border },
  statusLabel: { fontSize: FontSize.micro, fontWeight: FontWeight.medium },
  statusLabelActive: { color: Colors.accent.onContainer },
  statusLabelIdle: { color: Colors.ink.muted },
});
