import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';

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
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {filters.map((f) => {
        const isActive = f.value === active;
        return (
          <Pressable
            key={f.value}
            onPress={() => onSelect(f.value)}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillIdle]}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelIdle]}>
              {isActive ? `✓ ${f.label}` : f.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Height is fixed at 36 because app/(tabs)/library.tsx measures this row to size
  // the collapsing filter header — see FILTER_ROW_HEIGHT there.
  pill: {
    height: 36,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillActive: { backgroundColor: Colors.accent.container, borderColor: 'transparent' },
  pillIdle: { backgroundColor: Colors.surface.default, borderColor: Colors.border },
  label: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  labelActive: { color: Colors.accent.onContainer },
  labelIdle: { color: Colors.ink.muted },
});
