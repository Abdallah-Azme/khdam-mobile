import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastKind = 'success' | 'error' | 'info';
type ToastApi = { show: (message: string, kind?: ToastKind) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(
    null,
  );

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, kind });
    timer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,
            styles[toast.kind],
            { top: Math.max(insets.top, 12) + 8 },
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used within ToastProvider');
  return value;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '90%',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
  },
  success: { backgroundColor: '#46633b' },
  error: { backgroundColor: '#b42318' },
  info: { backgroundColor: '#243447' },
  toastText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
});
