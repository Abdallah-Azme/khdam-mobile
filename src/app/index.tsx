import { useSession } from '@/providers/session-provider';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexRoute() {
  const { isHydrating, session } = useSession();
  if (isHydrating) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/login" />;
  return (
    <Redirect
      href={
        session.user.isProfileComplete
          ? '/(app)/(tabs)'
          : '/(auth)/complete-profile'
      }
    />
  );
}

const styles = StyleSheet.create({ loading: { flex: 1, justifyContent: 'center' } });
