import { radii, spacing } from '@/constants/tokens';
import { useColors } from '@/hooks/use-colors';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

export function AuthHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function AuthCard({ children }: PropsWithChildren) {
  const colors = useColors();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>;
}

export function AuthButton({ label, onPress, disabled, secondary }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary ? colors.surface : colors.accent,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: secondary ? colors.text : colors.accentText }]}>{label}</Text>
    </Pressable>
  );
}

export function AuthField({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        {...props}
        placeholder={props.placeholder ?? label}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, color: colors.text },
          props.style,
        ]}
      />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    </View>
  );
}

export function InlineLink({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.link}>
      <Text style={{ color: colors.accent, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

export function FileButton({ label, value, onPress, error }: { label: string; value?: string; onPress: () => void; error?: string }) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.fileButton, { borderColor: error ? colors.danger : colors.border, backgroundColor: colors.surface }]}
      >
        <Text numberOfLines={1} style={{ color: value ? colors.text : colors.muted }}>{value ?? 'Choose file'}</Text>
      </Pressable>
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    </View>
  );
}

export const authStyles = StyleSheet.create({
  container: { justifyContent: 'center', gap: spacing.lg },
  form: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
});

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { fontSize: 16, lineHeight: 23 },
  card: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, gap: spacing.md },
  button: { minHeight: 50, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  buttonText: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  field: { gap: spacing.xs },
  label: { fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, fontSize: 16 },
  link: { alignItems: 'center', padding: spacing.sm },
  fileButton: { minHeight: 50, borderWidth: 1, borderRadius: radii.md, justifyContent: 'center', paddingHorizontal: spacing.md },
});
