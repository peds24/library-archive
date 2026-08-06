import { Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '@/src/theme/colors';

interface Props extends TextInputProps {
  label: string;
  required?: boolean;
}

// M3 "filled text field": label and input share one bordered container,
// bottom border in the accent color. See .field-m3 in
// inspo/mockups/ui-direction-material-crisp.html.
export default function M3TextField({ label, required, ...inputProps }: Props) {
  return (
    <View className="bg-surface-2 rounded-t-xl border-b-2 border-b-accent px-4 pt-3 pb-2">
      <Text className="text-[11px] text-accent font-medium uppercase tracking-wide mb-1">
        {label}
        {required && <Text className="text-red-400"> *</Text>}
      </Text>
      <TextInput
        className="text-ink text-base p-0"
        placeholderTextColor={colors.ink.faint}
        returnKeyType="next"
        {...inputProps}
      />
    </View>
  );
}
