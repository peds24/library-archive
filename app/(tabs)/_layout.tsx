import { Tabs } from 'expo-router';
import { ColorValue, Text, View } from 'react-native';
import { SymbolView, AndroidSymbol, SFSymbol } from 'expo-symbols';
import { colors } from '@/src/theme/colors';

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
function TabIcon({ focused, color, label, ios, android, web }: TabIconProps) {
  return (
    <View className="items-center justify-center gap-1 pt-1.5 pb-2">
      <View className={`w-12 h-7 items-center justify-center rounded-full ${focused ? 'bg-accent-container' : ''}`}>
        <SymbolView name={{ ios, android, web }} tintColor={color} size={22} />
      </View>
      <Text style={{ color, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.accent.onContainer,
        tabBarInactiveTintColor: colors.ink.muted,
        tabBarStyle: { backgroundColor: colors.surface.default, borderTopWidth: 0 },
        headerStyle: { backgroundColor: colors.surface.default },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.ink.default, fontWeight: '700', fontSize: 28 },
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
