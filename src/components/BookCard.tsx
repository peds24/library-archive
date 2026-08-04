import { Image, Text, View } from 'react-native';
import { Book } from '@/src/types/book';

const STATUS_BG: Record<Book['status'], string> = {
  reading: 'bg-blue-100',
  tbr: 'bg-amber-100',
  read: 'bg-green-100',
  shelved: 'bg-stone-100',
};

const STATUS_TEXT: Record<Book['status'], string> = {
  reading: 'text-blue-700',
  tbr: 'text-amber-700',
  read: 'text-green-700',
  shelved: 'text-stone-500',
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
}

export default function BookCard({ book, variant = 'compact', showStatus = false }: Props) {
  if (variant === 'large') {
    return (
      <View className="bg-white rounded-2xl p-4 flex-row gap-4 border border-stone-100">
        <Image
          source={{ uri: book.coverImage }}
          className="w-20 h-28 rounded-lg bg-stone-100"
          resizeMode="cover"
        />
        <View className="flex-1 justify-center gap-1">
          <Text className="text-stone-900 font-semibold text-base leading-snug" numberOfLines={2}>
            {book.title}
          </Text>
          <Text className="text-stone-500 text-sm">{book.author}</Text>
          <Text className="text-stone-400 text-xs mt-1">
            {book.genre} · {book.pages} pages
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-3 flex-row items-center gap-3 border border-stone-100">
      <Image
        source={{ uri: book.coverImage }}
        className="w-12 h-16 rounded-md bg-stone-100"
        resizeMode="cover"
      />
      <View className="flex-1 gap-0.5">
        <Text className="text-stone-900 font-medium text-sm leading-snug" numberOfLines={1}>
          {book.title}
        </Text>
        <Text className="text-stone-500 text-xs">{book.author}</Text>
        <Text className="text-stone-400 text-xs">{book.genre}</Text>
      </View>
      {showStatus && (
        <View className={`px-2 py-1 rounded-full ${STATUS_BG[book.status]}`}>
          <Text className={`text-xs font-medium ${STATUS_TEXT[book.status]}`}>
            {STATUS_LABEL[book.status]}
          </Text>
        </View>
      )}
    </View>
  );
}
