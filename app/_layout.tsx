import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../global.css';
import { initDatabase } from '@/src/services/database';
import { useBookStore } from '@/src/store/bookStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrate = useBookStore((s) => s.hydrate);

  useEffect(() => {
    const books = initDatabase();
    hydrate(books);
    SplashScreen.hideAsync();
  }, []);

  const headerBase = {
    headerStyle: { backgroundColor: '#fafaf9' },
    headerShadowVisible: false,
    headerTintColor: '#b45309',
    headerTitleStyle: { color: '#1c1917', fontWeight: '600' as const, fontSize: 16 },
  };

  return (
    <Stack screenOptions={headerBase}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="book/[id]" options={{ title: '' }} />
      <Stack.Screen name="add" options={{ title: 'Add Book', presentation: 'modal' }} />
      <Stack.Screen name="scan" options={{ title: 'Scan Book', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff', headerTitleStyle: { color: '#fff', fontWeight: '600' as const, fontSize: 16 }, headerShadowVisible: false }} />
      <Stack.Screen name="manual-entry" options={{ title: 'Add Manually', presentation: 'modal' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
