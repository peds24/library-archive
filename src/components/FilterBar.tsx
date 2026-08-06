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
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6, gap: 8, flexDirection: 'row', alignItems: 'center' }}
    >
      {filters.map((f) => {
        const isActive = f.value === active;
        return (
          <Pressable
            key={f.value}
            onPress={() => onSelect(f.value)}
            className={`h-9 px-3.5 items-center justify-center rounded-full border ${
              isActive ? 'bg-accent-container border-transparent' : 'bg-surface border-border'
            }`}
          >
            <Text className={`text-base font-medium ${isActive ? 'text-accent-on-container' : 'text-ink-muted'}`}>
              {isActive ? `✓ ${f.label}` : f.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
