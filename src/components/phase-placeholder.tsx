import { radii, spacing } from '@/constants/tokens';
import { useColors } from '@/hooks/use-colors';
import { useLanguage } from '@/providers/language-provider';
import { Screen } from '@/components/screen';
import { StyleSheet, Text, View } from 'react-native';

export function PhasePlaceholder({ title }: { title: string }) {
  const colors = useColors();
  const { isRtl, t } = useLanguage();
  return (
    <Screen contentStyle={styles.center}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text, textAlign: isRtl ? 'right' : 'left' }]}>
          {title}
        </Text>
        <Text style={[styles.body, { color: colors.muted, textAlign: isRtl ? 'right' : 'left' }]}>
          {t('migrationInProgress')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm },
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22 },
});
