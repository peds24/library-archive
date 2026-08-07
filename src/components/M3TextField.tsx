import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Colors, FontSize, FontWeight, LetterSpacing, Radius, Spacing } from '@/src/theme';

interface Props extends TextInputProps {
  label: string;
  required?: boolean;
}

// M3 "filled text field": label and input share one bordered container,
// bottom border in the accent color. See .field-m3 in
// inspo/mockups/ui-direction-material-crisp.html.
export default function M3TextField({ label, required, style, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={Colors.ink.faint}
        returnKeyType="next"
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.raised,
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent.default,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.micro,
    color: Colors.accent.default,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.wide,
    marginBottom: Spacing.xs,
  },
  required: { color: Colors.dangerText },
  input: { color: Colors.ink.default, fontSize: FontSize.base, padding: 0 },
});
