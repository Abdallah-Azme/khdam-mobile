import type { LoginFormValues } from '@/features/auth/schemas/login-schema';
import type { LoginPayload } from '@/features/auth/types';

export function buildLoginPayload(values: LoginFormValues): LoginPayload {
  if (values.loginType === 'email') {
    return {
      login_type: 'email',
      email: values.email.trim(),
      password: values.password,
    };
  }
  return {
    login_type: 'phone',
    country_id: Number(values.countryId),
    phone: values.phone.trim(),
    password: values.password,
  };
}
