import { AuthButton, AuthCard, AuthField, AuthHeader, FileButton, InlineLink, authStyles } from '@/features/auth/components/auth-ui';
import {
  useCheckResetCode,
  useCompleteProfile,
  useForgotPassword,
  useNewPassword,
  useRegister,
  useResendOtp,
  useVerifyOtp,
} from '@/features/auth/hooks/use-auth-flow';
import {
  newPasswordSchema,
  officeProfileSchema,
  otpSchema,
  phoneSchema,
  registerSchema,
  seekerProfileSchema,
} from '@/features/auth/schemas/auth-flow-schemas';
import type { NativeUpload } from '@/features/auth/types';
import { pickDocument, pickImage } from '@/features/auth/utils/native-files';
import { loginResponseToSession } from '@/features/auth/utils/to-session';
import { Screen } from '@/components/screen';
import { useSession } from '@/providers/session-provider';
import { useToast } from '@/providers/toast-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

type AuthScreenName = 'sign-up' | 'verify-otp' | 'forgot-password' | 'reset-otp' | 'new-password' | 'complete-profile';

export default function AuthFlowScreen() {
  const { screen } = useLocalSearchParams<{ screen: AuthScreenName }>();
  if (screen === 'sign-up') return <SignUpScreen />;
  if (screen === 'verify-otp') return <VerifyOtpScreen />;
  if (screen === 'forgot-password') return <ForgotPasswordScreen />;
  if (screen === 'reset-otp') return <ResetOtpScreen />;
  if (screen === 'new-password') return <NewPasswordScreen />;
  if (screen === 'complete-profile') return <CompleteProfileScreen />;
  return <SignUpScreen />;
}

function SignUpScreen() {
  const toast = useToast();
  const mutation = useRegister();
  const [type, setType] = useState<'1' | '2' | null>(null);
  const [countryId, setCountryId] = useState('1');
  const [phone, setPhone] = useState('');
  const submit = async () => {
    const parsed = registerSchema.safeParse({ type, countryId, phone });
    if (!parsed.success) return toast.show(parsed.error.issues[0]?.message ?? 'Check the form', 'error');
    try {
      await mutation.mutateAsync({ type: parsed.data.type, country_id: Number(countryId), phone: phone.trim() });
      router.push({ pathname: '/(auth)/[screen]', params: { screen: 'verify-otp', phone, country_id: countryId, type: parsed.data.type } });
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Registration failed', 'error');
    }
  };
  return (
    <AuthShell>
      <AuthHeader title="Create account" subtitle="Choose your account type and enter your phone number." />
      <AuthCard>
        <View style={authStyles.row}>
          <AuthButton label="Seeker" secondary={type !== '1'} onPress={() => setType('1')} />
          <AuthButton label="Office" secondary={type !== '2'} onPress={() => setType('2')} />
        </View>
        <AuthField label="Country ID" keyboardType="number-pad" value={countryId} onChangeText={setCountryId} />
        <AuthField label="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <AuthButton label={mutation.isPending ? 'Creating...' : 'Sign up'} disabled={mutation.isPending} onPress={() => void submit()} />
      </AuthCard>
      <InlineLink label="Back to login" onPress={() => router.replace('/(auth)/login')} />
    </AuthShell>
  );
}

function VerifyOtpScreen() {
  const params = usePhoneParams();
  const toast = useToast();
  const { signIn } = useSession();
  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(40);

  useEffect(() => {
    if (!params.phone) router.replace('/(auth)/login');
  }, [params.phone]);
  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((value) => value - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const submit = async () => {
    const parsed = otpSchema.safeParse({ otp });
    if (!parsed.success || !params.phone) return toast.show(parsed.error?.issues[0]?.message ?? 'Enter OTP', 'error');
    try {
      const response = await verifyMutation.mutateAsync({
        phone: params.phone,
        country_id: params.countryId,
        otp: parsed.data.otp,
        device_id: getDeviceId(),
        device_type: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
      });
      const token = response.data.token;
      if (response.data.user.is_completed_profile === 1 && token) {
        await signIn(loginResponseToSession({ ...response, data: { ...response.data, token, is_completed_profile: 1 } }));
        router.replace('/(app)/(tabs)');
      } else {
        router.replace({ pathname: '/(auth)/[screen]', params: { screen: 'complete-profile', phone: response.data.user.phone, country_id: String(params.countryId), type: response.data.user.type } });
      }
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Verification failed', 'error');
    }
  };

  const resend = async () => {
    if (!params.phone) return;
    try {
      await resendMutation.mutateAsync({ phone: params.phone, country_id: params.countryId });
      setTimer(40);
      toast.show('OTP sent', 'success');
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Unable to resend OTP', 'error');
    }
  };

  return (
    <AuthShell>
      <AuthHeader title="Verify OTP" subtitle={`Enter the code sent to ${params.phone ?? 'your phone'}.`} />
      <AuthCard>
        <AuthField label="OTP code" keyboardType="number-pad" value={otp} maxLength={6} onChangeText={setOtp} />
        <AuthButton label={verifyMutation.isPending ? 'Verifying...' : 'Verify'} disabled={verifyMutation.isPending} onPress={() => void submit()} />
        <AuthButton label={timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'} secondary disabled={timer > 0 || resendMutation.isPending} onPress={() => void resend()} />
      </AuthCard>
    </AuthShell>
  );
}

function ForgotPasswordScreen() {
  const toast = useToast();
  const mutation = useForgotPassword();
  const [countryId, setCountryId] = useState('1');
  const [phone, setPhone] = useState('');
  const submit = async () => {
    const parsed = phoneSchema.safeParse({ countryId, phone });
    if (!parsed.success) return toast.show(parsed.error.issues[0]?.message ?? 'Check the form', 'error');
    try {
      await mutation.mutateAsync({ phone: phone.trim(), country_id: Number(countryId) });
      router.push({ pathname: '/(auth)/[screen]', params: { screen: 'reset-otp', phone, country_id: countryId } });
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Unable to send reset code', 'error');
    }
  };
  return (
    <AuthShell>
      <AuthHeader title="Forgot password" subtitle="Enter your phone number to receive a reset code." />
      <AuthCard>
        <AuthField label="Country ID" keyboardType="number-pad" value={countryId} onChangeText={setCountryId} />
        <AuthField label="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <AuthButton label={mutation.isPending ? 'Sending...' : 'Send reset code'} disabled={mutation.isPending} onPress={() => void submit()} />
      </AuthCard>
      <InlineLink label="Back to login" onPress={() => router.replace('/(auth)/login')} />
    </AuthShell>
  );
}

function ResetOtpScreen() {
  const params = usePhoneParams();
  const toast = useToast();
  const mutation = useCheckResetCode();
  const [code, setCode] = useState('');
  const submit = async () => {
    const parsed = otpSchema.safeParse({ otp: code });
    if (!parsed.success || !params.phone) return toast.show(parsed.error?.issues[0]?.message ?? 'Enter code', 'error');
    try {
      await mutation.mutateAsync({ phone: params.phone, country_id: params.countryId, code });
      router.push({ pathname: '/(auth)/[screen]', params: { screen: 'new-password', phone: params.phone, country_id: String(params.countryId) } });
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Invalid code', 'error');
    }
  };
  return (
    <AuthShell>
      <AuthHeader title="Reset code" subtitle="Enter the password reset code." />
      <AuthCard>
        <AuthField label="Reset code" keyboardType="number-pad" value={code} maxLength={6} onChangeText={setCode} />
        <AuthButton label={mutation.isPending ? 'Checking...' : 'Continue'} disabled={mutation.isPending} onPress={() => void submit()} />
      </AuthCard>
    </AuthShell>
  );
}

function NewPasswordScreen() {
  const params = usePhoneParams();
  const toast = useToast();
  const mutation = useNewPassword();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const submit = async () => {
    const parsed = newPasswordSchema.safeParse({ password, passwordConfirmation });
    if (!parsed.success || !params.phone) return toast.show(parsed.error?.issues[0]?.message ?? 'Check passwords', 'error');
    try {
      await mutation.mutateAsync({ phone: params.phone, country_id: params.countryId, password, password_confirmation: passwordConfirmation });
      toast.show('Password reset successfully', 'success');
      router.replace('/(auth)/login');
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Unable to reset password', 'error');
    }
  };
  return (
    <AuthShell>
      <AuthHeader title="New password" subtitle="Set your new account password." />
      <AuthCard>
        <AuthField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <AuthField label="Confirm password" secureTextEntry value={passwordConfirmation} onChangeText={setPasswordConfirmation} />
        <AuthButton label={mutation.isPending ? 'Saving...' : 'Save password'} disabled={mutation.isPending} onPress={() => void submit()} />
      </AuthCard>
    </AuthShell>
  );
}

function CompleteProfileScreen() {
  const params = usePhoneParams();
  const raw = useLocalSearchParams<{ type?: string }>();
  const toast = useToast();
  const { session, signIn } = useSession();
  const mutation = useCompleteProfile();
  const userType = useMemo<'1' | '2'>(() => (raw.type === '2' || session?.user.apiUserType === '2' ? '2' : '1'), [raw.type, session]);
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<NativeUpload | null>(null);
  const [coverImage, setCoverImage] = useState<NativeUpload | null>(null);
  const [license, setLicense] = useState<NativeUpload | null>(null);
  const [managerIdImage, setManagerIdImage] = useState<NativeUpload | null>(null);
  const [stateId, setStateId] = useState('');
  const [mapDesc, setMapDesc] = useState('');
  const [website, setWebsite] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [nationalNumberManager, setNationalNumberManager] = useState('');
  const [phoneManager, setPhoneManager] = useState('');
  const [description, setDescription] = useState('');

  const submit = async () => {
    const values = { name, stateId, mapDesc, website, whatsapp, email, nationalNumberManager, phoneManager, description };
    const parsed = (userType === '2' ? officeProfileSchema : seekerProfileSchema).safeParse(values);
    if (!parsed.success) return toast.show(parsed.error.issues[0]?.message ?? 'Check the form', 'error');
    if (!profileImage) return toast.show('Profile image is required', 'error');
    if (userType === '2' && (!coverImage || !license || !managerIdImage)) return toast.show('All office documents are required', 'error');
    try {
      const response = await mutation.mutateAsync({
        userType,
        name,
        country_id: params.countryId,
        phone: params.phone,
        image: profileImage,
        cover_image: coverImage ?? undefined,
        commercial_license: license ?? undefined,
        manager_id_image: managerIdImage ?? undefined,
        state_id: stateId,
        lat: '0',
        lng: '0',
        map_desc: mapDesc,
        website,
        whatsapp,
        email,
        national_number_manager: nationalNumberManager,
        country_id_manager: 1,
        phone_manager: phoneManager,
        description,
      });
      if (response.data.token) {
        await signIn(loginResponseToSession({ status: response.status, message: response.message, data: { user: response.data.user, token: response.data.token, is_completed_profile: 1 }, errors: response.errors }));
        router.replace('/(app)/(tabs)');
      } else {
        toast.show('Profile submitted. Please wait for approval.', 'success');
        router.replace('/(auth)/login');
      }
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Unable to complete profile', 'error');
    }
  };

  return (
    <AuthShell>
      <AuthHeader title="Complete profile" subtitle={userType === '2' ? 'Add office details and required documents.' : 'Add your name and profile image.'} />
      <AuthCard>
        <FileButton label="Profile image" value={profileImage?.name} onPress={() => pickImage().then(setProfileImage)} />
        <AuthField label={userType === '2' ? 'Business name' : 'Full name'} value={name} onChangeText={setName} />
        {userType === '2' ? (
          <>
            <FileButton label="Cover image" value={coverImage?.name} onPress={() => pickImage().then(setCoverImage)} />
            <AuthField label="State ID" value={stateId} onChangeText={setStateId} />
            <AuthField label="Address details" value={mapDesc} onChangeText={setMapDesc} />
            <AuthField label="Website" value={website} onChangeText={setWebsite} autoCapitalize="none" />
            <AuthField label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />
            <AuthField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <FileButton label="Commercial license" value={license?.name} onPress={() => pickDocument().then(setLicense)} />
            <AuthField label="Manager national number" value={nationalNumberManager} onChangeText={setNationalNumberManager} keyboardType="number-pad" />
            <AuthField label="Manager phone" value={phoneManager} onChangeText={setPhoneManager} keyboardType="phone-pad" />
            <FileButton label="Manager ID image" value={managerIdImage?.name} onPress={() => pickImage().then(setManagerIdImage)} />
            <AuthField label="Description" value={description} onChangeText={setDescription} multiline />
          </>
        ) : null}
        <AuthButton label={mutation.isPending ? 'Saving...' : 'Complete profile'} disabled={mutation.isPending} onPress={() => void submit()} />
      </AuthCard>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll contentStyle={authStyles.container}>{children}</Screen>
    </KeyboardAvoidingView>
  );
}

function usePhoneParams() {
  const params = useLocalSearchParams<{ phone?: string; country_id?: string }>();
  return { phone: params.phone, countryId: Number(params.country_id ?? 1) };
}

function getDeviceId() {
  return `rn-${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
