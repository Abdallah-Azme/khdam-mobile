import { useSession } from '@/providers/session-provider';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isHydrating, session } = useSession();
  if (isHydrating) return null;
  if (session?.user.isProfileComplete) return <Redirect href="/(app)/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
