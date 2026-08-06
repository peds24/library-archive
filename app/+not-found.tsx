import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-ink text-lg font-semibold">Page not found.</Text>
        <Link href="/" className="mt-4">
          <Text className="text-accent text-base">Go home</Text>
        </Link>
      </View>
    </>
  );
}
