import type { LoginResponse } from '@/features/auth/types';
import type { Session } from '@/types/session';

export function loginResponseToSession(response: LoginResponse): Session {
  const { token, user } = response.data;
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.type === '2' ? 'office' : 'seeker',
      apiUserType: user.type === '2' ? '2' : '1',
      isProfileComplete: user.is_completed_profile === 1,
    },
  };
}
