import { darkColors, lightColors } from '@/constants/tokens';
import { useAppTheme } from '@/providers/theme-provider';

export function useColors() {
  return useAppTheme().resolvedTheme === 'dark' ? darkColors : lightColors;
}
