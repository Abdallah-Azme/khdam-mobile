import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/screen';
import { radii, spacing } from '@/constants/tokens';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login-schema';
import { useLogin } from '@/features/auth/hooks/use-login';
import { buildLoginPayload } from '@/features/auth/utils/build-login-payload';
import { loginResponseToSession } from '@/features/auth/utils/to-session';
import { useColors } from '@/hooks/use-colors';
import { useLanguage } from '@/providers/language-provider';
import { useSession } from '@/providers/session-provider';
import { useToast } from '@/providers/toast-provider';

export default function LoginScreen() {
  const colors = useColors();
  const { isRtl, t } = useLanguage();
  const { signIn } = useSession();
  const toast = useToast();
  const loginMutation = useLogin();
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { loginType: 'phone', countryId: '1', phone: '', email: '', password: '' },
  });
  const loginType = useWatch({ control, name: 'loginType' });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await loginMutation.mutateAsync(buildLoginPayload(values));
      const nextSession = loginResponseToSession(response);
      await signIn(nextSession);
      if (!nextSession.user.isProfileComplete) {
        router.replace({ pathname: '/(auth)/[screen]', params: { screen: 'complete-profile', phone: response.data.user.phone, country_id: String(response.data.user.country_id) } });
      }
    } catch (error) {
      toast.show(error instanceof Error ? error.message : t('loginFailed'), 'error');
    }
  });

  const createDevelopmentSession = (role: 'seeker' | 'office') =>
    signIn({
      token: `phase-1-${role}-session`,
      user: {
        role,
        apiUserType: role === 'office' ? '2' : '1',
        name: `Phase 1 ${role}`,
        isProfileComplete: true,
      },
    });

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll contentStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, textAlign: isRtl ? 'right' : 'left' }]}>{t('appName')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted, textAlign: isRtl ? 'right' : 'left' }]}>{t('signIn')}</Text>
        </View>
        <Controller control={control} name="loginType" render={({ field }) => (
          <View style={styles.segment}>
            <ActionButton label={t('phoneLogin')} onPress={() => field.onChange('phone')} secondary={field.value !== 'phone'} />
            <ActionButton label={t('emailLogin')} onPress={() => field.onChange('email')} secondary={field.value !== 'email'} />
          </View>
        )} />
        <View style={styles.form}>
          {loginType === 'phone' ? (
            <>
              <FormField control={control} name="countryId" label={t('countryId')} keyboardType="number-pad" />
              <FormField control={control} name="phone" label={t('phone')} keyboardType="phone-pad" />
            </>
          ) : <FormField control={control} name="email" label={t('email')} keyboardType="email-address" autoCapitalize="none" />}
          <FormField control={control} name="password" label={t('password')} secureTextEntry />
          <ActionButton label={loginMutation.isPending ? '...' : t('signIn')} onPress={() => void onSubmit()} />
          <View style={styles.links}>
            <LinkButton label="Create account" onPress={() => router.push({ pathname: '/(auth)/[screen]', params: { screen: 'sign-up' } })} />
            <LinkButton label="Forgot password?" onPress={() => router.push({ pathname: '/(auth)/[screen]', params: { screen: 'forgot-password' } })} />
          </View>
        </View>
        {__DEV__ ? (
          <View style={styles.development}>
            <Text style={{ color: colors.muted }}>{t('developmentAccess')}</Text>
            <View style={styles.segment}>
              <ActionButton label={t('continueAsSeeker')} onPress={() => void createDevelopmentSession('seeker')} secondary />
              <ActionButton label={t('continueAsOffice')} onPress={() => void createDevelopmentSession('office')} secondary />
            </View>
          </View>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function FormField({ control, name, label, ...inputProps }: { control: ReturnType<typeof useForm<LoginFormValues>>['control']; name: keyof LoginFormValues; label: string } & React.ComponentProps<typeof TextInput>) {
  const colors = useColors();
  return <Controller control={control} name={name} render={({ field, fieldState }) => (
    <View style={styles.field}>
      <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
      <TextInput {...inputProps} value={String(field.value ?? '')} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={label} placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: fieldState.error ? colors.danger : colors.border }]} />
      {fieldState.error ? <Text style={{ color: colors.danger }}>{fieldState.error.message}</Text> : null}
    </View>
  )} />;
}

function ActionButton({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: secondary ? colors.surface : colors.accent, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[styles.buttonText, { color: secondary ? colors.text : colors.accentText }]}>{label}</Text>
    </Pressable>
  );
}

function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.linkButton}>
      <Text style={{ color: colors.accent, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { justifyContent: 'center', gap: spacing.lg },
  header: { gap: spacing.sm },
  title: { fontSize: 40, fontWeight: '800' },
  subtitle: { fontSize: 16, lineHeight: 24 },
  actions: { gap: spacing.md },
  segment: { flexDirection: 'row', gap: spacing.sm },
  form: { gap: spacing.md },
  field: { gap: spacing.xs },
  links: { gap: spacing.xs, alignItems: 'center' },
  linkButton: { padding: spacing.xs },
  input: { minHeight: 50, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, fontSize: 16 },
  development: { gap: spacing.sm, marginTop: spacing.lg },
  button: { minHeight: 50, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
