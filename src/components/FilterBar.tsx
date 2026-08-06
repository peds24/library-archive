import { Pressable, ScrollView, Text } from 'react-native';

interface FilterOption<T extends string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  filters: FilterOption<T>[];
  active: T;
  onSelect: (value: T) => void;
}

export default function FilterBar<T extends string>({ filters, active, onSelect }: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' }}
      className="border-b border-stone-200 bg-stone-50"
    >
      {filters.map((f) => {
        const isActive = f.value === active;
        return (
          <Pressable
            key={f.value}
            onPress={() => onSelect(f.value)}
            className={`px-3 py-1.5 rounded-full ${isActive ? 'bg-accent' : 'bg-stone-100'}`}
          >
            <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-stone-600'}`}>
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
