import { AppProviders } from '@/providers/app-providers';
import { useAppTheme } from '@/providers/theme-provider';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export { ErrorBoundary } from 'expo-router';

function RootNavigator() {
  const { resolvedTheme } = useAppTheme();
  return (
    <ThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
