import { login } from '@/features/auth/api/auth-api';
import { useMutation } from '@tanstack/react-query';

export function useLogin() {
  return useMutation({ mutationFn: login });
}
