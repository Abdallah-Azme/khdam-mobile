import { useSession } from '@/providers/session-provider';
import { Redirect, Stack } from 'expo-router';

export default function AppLayout() {
  const { isHydrating, session } = useSession();
  if (isHydrating) return null;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (!session.user.isProfileComplete) {
    return <Redirect href="/(auth)/complete-profile" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
