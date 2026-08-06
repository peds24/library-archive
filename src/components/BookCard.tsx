import { Image, Pressable, Text, View } from 'react-native';
import { Book } from '@/src/types/book';

const STATUS_BG: Record<Book['status'], string> = {
  reading: 'bg-status-reading-bg',
  tbr: 'bg-status-tbr-bg',
  read: 'bg-status-read-bg',
  shelved: 'bg-status-shelved-bg',
};

const STATUS_TEXT: Record<Book['status'], string> = {
  reading: 'text-status-reading-fg',
  tbr: 'text-status-tbr-fg',
  read: 'text-status-read-fg',
  shelved: 'text-status-shelved-fg',
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
      <Pressable onPress={onPress} className="active:opacity-70">
        <View className="bg-accent-container rounded-[20px] p-4 flex-row gap-4">
          <Image
            source={{ uri: book.coverImage }}
            className="w-20 h-28 rounded-xl bg-surface-2"
            resizeMode="cover"
          />
          <View className="flex-1 justify-center gap-1">
            <Text className="text-accent-on-container font-semibold text-base leading-snug" numberOfLines={2}>
              {book.title}
            </Text>
            <Text className="text-ink-muted text-sm">{book.author}</Text>
            <Text className="text-ink-faint text-xs mt-1">
              {book.genre} · {book.pages} pages
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} className="rounded-2xl p-3 flex-row items-center gap-3 active:bg-surface-2">
      <Image
        source={{ uri: book.coverImage }}
        className="w-14 h-20 rounded-lg bg-surface-2"
        resizeMode="cover"
      />
      <View className="flex-1 gap-1">
        <Text className="text-ink font-medium text-base leading-snug" numberOfLines={1}>
          {book.title}
        </Text>
        <Text className="text-ink-muted text-sm">{book.author}</Text>
        <Text className="text-ink-faint text-sm">{book.genre}</Text>
      </View>
      {showStatus && (
        <View className={`px-2.5 py-1 rounded-full ${STATUS_BG[book.status]}`}>
          <Text className={`text-sm font-medium ${STATUS_TEXT[book.status]}`}>
            {STATUS_LABEL[book.status]}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
