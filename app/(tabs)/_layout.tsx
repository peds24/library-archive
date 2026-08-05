import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#b45309',
        tabBarInactiveTintColor: '#a8a29e',
        tabBarStyle: { backgroundColor: '#fafaf9', borderTopColor: '#e7e5e4' },
        headerStyle: { backgroundColor: '#fafaf9' },
        headerShadowVisible: false,
        headerTitleStyle: { color: '#1c1917', fontWeight: '600', fontSize: 18 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Reading',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'book.fill', android: 'auto_stories', web: 'book' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'books.vertical.fill', android: 'shelves', web: 'library_books' }}
              tintColor={color}
              size={24}
            />
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/add')}
              style={{ marginRight: 16 }}
              hitSlop={8}
            >
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                tintColor="#b45309"
                size={26}
              />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
