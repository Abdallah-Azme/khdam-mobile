import { LanguageProvider } from '@/providers/language-provider';
import { AppQueryProvider } from '@/providers/query-provider';
import { SessionProvider } from '@/providers/session-provider';
import { AppThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { UserRoleProvider } from '@/providers/user-role-provider';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <AppQueryProvider>
        <AppThemeProvider>
          <LanguageProvider>
            <SessionProvider>
              <UserRoleProvider>
                <ToastProvider>{children}</ToastProvider>
              </UserRoleProvider>
            </SessionProvider>
          </LanguageProvider>
        </AppThemeProvider>
      </AppQueryProvider>
    </SafeAreaProvider>
  );
}
