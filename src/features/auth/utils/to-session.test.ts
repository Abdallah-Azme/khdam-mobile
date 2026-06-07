import type { LoginResponse } from '@/features/auth/types';

import { loginResponseToSession } from './to-session';

describe('loginResponseToSession', () => {
  it('maps office and profile-completion state', () => {
    const response: LoginResponse = {
      status: true,
      message: 'ok',
      errors: [],
      data: {
        token: 'token',
        is_completed_profile: 0,
        user: {
          id: 7,
          is_completed_profile: 0,
          name: null,
          email: null,
          type: '2',
          type_text: 'Office',
          phone: '55512345',
          country_id: 1,
          image: null,
        },
      },
    };

    expect(loginResponseToSession(response)).toEqual({
      token: 'token',
      user: {
        id: 7,
        name: null,
        role: 'office',
        apiUserType: '2',
        isProfileComplete: false,
      },
    });
  });
});
