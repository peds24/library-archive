import { Tabs } from 'expo-router';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { SymbolView, AndroidSymbol, SFSymbol } from 'expo-symbols';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';

interface TabIconProps {
  focused: boolean;
  color: ColorValue;
  label: string;
  ios: SFSymbol;
  android: AndroidSymbol;
  web: AndroidSymbol;
}

// Renders icon + label together so the focused pill can wrap just the
// icon without React Navigation's separate label overlapping it.
// NB: this whole thing is laid out inside React Navigation's fixed-size
// icon slot (see tabBarIconStyle below) — it does NOT get to size itself.
function TabIcon({ focused, color, label, ios, android, web }: TabIconProps) {
  return (
    <View style={styles.tabIcon}>
      <View style={[styles.iconPill, focused && styles.iconPillFocused]}>
        <SymbolView name={{ ios, android, web }} tintColor={color} size={24} />
      </View>
      <Text style={[styles.tabLabel, { color }]} numberOfLines={1} allowFontScaling={false}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.accent.onContainer,
        tabBarInactiveTintColor: Colors.ink.muted,
        // React Navigation renders tabBarIcon into a fixed-size slot (31x28 by
        // default) meant for an icon-only glyph. Our TabIcon packs an icon pill
        // AND a label into that slot, so without an explicit override here the
        // label gets squeezed, wraps to two lines, and is clipped.
        tabBarIconStyle: { width: 80, height: 52 },
        tabBarStyle: { backgroundColor: Colors.surface.default, borderTopWidth: 0, height: 80 },
        headerStyle: { backgroundColor: Colors.surface.default },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: Colors.ink.default,
          fontWeight: FontWeight.bold,
          fontSize: FontSize.screenTitle,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reading',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} label="Reading" ios="book.fill" android="auto_stories" web="book" />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} label="Library" ios="books.vertical.fill" android="shelves" web="library_books" />
          ),
          // headerRight is set dynamically by app/(tabs)/library.tsx itself,
          // since it needs to react to that screen's own search-toggle state.
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  iconPill: {
    width: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  iconPillFocused: { backgroundColor: Colors.accent.container },
  tabLabel: { fontSize: 13, fontWeight: FontWeight.semibold },
});
