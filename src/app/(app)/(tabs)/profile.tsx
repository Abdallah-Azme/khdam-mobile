import { radii, spacing } from '@/constants/tokens';
import { useColors } from '@/hooks/use-colors';
import { useLanguage } from '@/providers/language-provider';
import { useSession } from '@/providers/session-provider';
import { useAppTheme } from '@/providers/theme-provider';
import { useUserRole } from '@/providers/user-role-provider';
import { Screen } from '@/components/screen';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const colors = useColors();
  const { language, setLanguage, t } = useLanguage();
  const { preference, setPreference } = useAppTheme();
  const { role, setRole } = useUserRole();
  const { signOut } = useSession();
  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('profile')}</Text>
      <SettingRow label={`Role: ${role}`} action="Switch" onPress={() => void setRole(role === 'office' ? 'seeker' : 'office')} />
      <SettingRow label={`Language: ${language}`} action={language === 'ar' ? 'EN' : 'AR'} onPress={() => void setLanguage(language === 'ar' ? 'en' : 'ar')} />
      <SettingRow label={`Theme: ${preference}`} action="Change" onPress={() => void setPreference(preference === 'system' ? 'light' : preference === 'light' ? 'dark' : 'system')} />
      <SettingRow label={t('signOut')} action={t('signOut')} onPress={() => void signOut()} danger />
    </Screen>
  );
}

function SettingRow({ label, action, onPress, danger = false }: { label: string; action: string; onPress: () => void; danger?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={[styles.action, { backgroundColor: colors.accent }]}>
        <Text style={{ color: colors.accentText, fontWeight: '700' }}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  title: { fontSize: 28, fontWeight: '800', marginBottom: spacing.sm },
  row: { minHeight: 64, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  label: { flex: 1, fontSize: 15, fontWeight: '600' },
  action: { borderRadius: radii.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});
