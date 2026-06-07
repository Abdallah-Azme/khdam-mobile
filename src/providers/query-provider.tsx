import NetInfo from '@react-native-community/netinfo';
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
);

export function AppQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnReconnect: true,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;
    return AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    }).remove;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
