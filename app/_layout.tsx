import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import '../global.css';
import { initDatabase } from '@/src/services/database';
import { useBookStore } from '@/src/store/bookStore';
import { colors } from '@/src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrate = useBookStore((s) => s.hydrate);

  useEffect(() => {
    const books = initDatabase();
    hydrate(books);
    SplashScreen.hideAsync();
  }, []);

  const headerBase = {
    headerStyle: { backgroundColor: colors.surface.default },
    headerShadowVisible: false,
    headerTintColor: colors.accent.default,
    headerTitleStyle: { color: colors.ink.default, fontWeight: '600' as const, fontSize: 16 },
  };

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={headerBase}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book/[id]" options={{ title: '' }} />
        <Stack.Screen name="add" options={{ title: 'Add Book', presentation: 'modal' }} />
        <Stack.Screen name="scan" options={{ title: 'Scan Book', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff', headerTitleStyle: { color: '#fff', fontWeight: '600' as const, fontSize: 16 }, headerShadowVisible: false }} />
        <Stack.Screen name="scan-review" options={{ title: 'Confirm Book' }} />
        <Stack.Screen name="manual-entry" options={{ title: 'Add Manually', presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
