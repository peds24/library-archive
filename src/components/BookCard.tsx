import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import { Book } from '@/src/types/book';

// Status colors are looked up by value rather than composed into a string. Under
// NativeWind that was a hard requirement — the Tailwind scanner only sees literal
// class names — but it survives the port because it is still the clearest way to
// keep the four status treatments side by side.
const STATUS_STYLE: Record<Book['status'], { bg: string; fg: string }> = {
  reading: Colors.status.reading,
  tbr: Colors.status.tbr,
  read: Colors.status.read,
  shelved: Colors.status.shelved,
};

const STATUS_LABEL: Record<Book['status'], string> = {
  reading: 'Reading',
  tbr: 'TBR',
  read: 'Read',
  shelved: 'Shelved',
};

interface Props {
  book: Book;
  variant?: 'large' | 'compact';
  showStatus?: boolean;
  onPress?: () => void;
}

export default function BookCard({ book, variant = 'compact', showStatus = false, onPress }: Props) {
  if (variant === 'large') {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => (pressed ? styles.pressedFade : undefined)}>
        <View style={styles.largeCard}>
          <Image source={{ uri: book.coverImage }} style={styles.largeCover} resizeMode="cover" />
          <View style={styles.largeText}>
            <Text style={styles.largeTitle} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={styles.author}>{book.author}</Text>
            <Text style={styles.largeMeta}>
              {book.genre} · {book.pages} pages
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.compactCard, pressed && styles.pressedHighlight]}
    >
      <Image source={{ uri: book.coverImage }} style={styles.compactCover} resizeMode="cover" />
      <View style={styles.compactText}>
        <Text style={styles.compactTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={styles.author}>{book.author}</Text>
        <Text style={styles.genre}>{book.genre}</Text>
      </View>
      {showStatus && (
        <View style={[styles.statusPill, { backgroundColor: STATUS_STYLE[book.status].bg }]}>
          <Text style={[styles.statusLabel, { color: STATUS_STYLE[book.status].fg }]}>
            {STATUS_LABEL[book.status]}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressedFade: { opacity: 0.7 },
  pressedHighlight: { backgroundColor: Colors.surface.raised },

  largeCard: {
    backgroundColor: Colors.accent.container,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  largeCover: {
    width: 80,
    height: 112,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface.raised,
  },
  largeText: { flex: 1, justifyContent: 'center', gap: Spacing.xs },
  largeTitle: {
    color: Colors.accent.onContainer,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    lineHeight: 22,
  },
  largeMeta: { color: Colors.ink.faint, fontSize: FontSize.xs, marginTop: Spacing.xs },

  compactCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  compactCover: {
    width: 56,
    height: 80,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface.raised,
  },
  compactText: { flex: 1, gap: Spacing.xs },
  compactTitle: {
    color: Colors.ink.default,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
  },

  author: { color: Colors.ink.muted, fontSize: FontSize.sm },
  genre: { color: Colors.ink.faint, fontSize: FontSize.sm },

  statusPill: { paddingHorizontal: 10, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  statusLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
});
