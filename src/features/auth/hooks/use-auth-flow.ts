import {
  checkResetCode,
  completeProfile,
  forgotPassword,
  newPassword,
  register,
  resendOtp,
  verifyOtp,
} from '@/features/auth/api/auth-api';
import { useMutation } from '@tanstack/react-query';

export const useRegister = () => useMutation({ mutationFn: register });
export const useVerifyOtp = () => useMutation({ mutationFn: verifyOtp });
export const useResendOtp = () => useMutation({ mutationFn: resendOtp });
export const useForgotPassword = () => useMutation({ mutationFn: forgotPassword });
export const useCheckResetCode = () => useMutation({ mutationFn: checkResetCode });
export const useNewPassword = () => useMutation({ mutationFn: newPassword });
export const useCompleteProfile = () => useMutation({ mutationFn: completeProfile });
