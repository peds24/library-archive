import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initDatabase } from '@/src/services/database';
import { useBookStore } from '@/src/store/bookStore';
import { Colors, FontSize, FontWeight } from '@/src/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrate = useBookStore((s) => s.hydrate);

  useEffect(() => {
    const books = initDatabase();
    hydrate(books);
    SplashScreen.hideAsync();
  }, []);

  const headerBase = {
    headerStyle: { backgroundColor: Colors.surface.default },
    headerShadowVisible: false,
    headerTintColor: Colors.accent.default,
    headerTitleStyle: {
      color: Colors.ink.default,
      fontWeight: FontWeight.semibold,
      fontSize: FontSize.base,
    },
  };

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={headerBase}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book/[id]" options={{ title: '' }} />
        <Stack.Screen name="add" options={{ title: 'Add Book', presentation: 'modal' }} />
        {/* The scanner is a full-bleed camera view, so its header drops the app's
            off-black surface for true black — see Colors.camera. */}
        <Stack.Screen
          name="scan"
          options={{
            title: 'Scan Book',
            headerStyle: { backgroundColor: Colors.camera.bg },
            headerTintColor: Colors.ink.default,
            headerTitleStyle: {
              color: Colors.ink.default,
              fontWeight: FontWeight.semibold,
              fontSize: FontSize.base,
            },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen name="scan-review" options={{ title: 'Confirm Book' }} />
        <Stack.Screen name="manual-entry" options={{ title: 'Add Manually', presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
