import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/theme';
import { CommonStyles } from '@/src/theme/common';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={CommonStyles.screenCentered}>
        <Text style={styles.heading}>Page not found.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkLabel}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: Colors.ink.default,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  link: { marginTop: Spacing.lg },
  linkLabel: { color: Colors.accent.default, fontSize: FontSize.base },
});
