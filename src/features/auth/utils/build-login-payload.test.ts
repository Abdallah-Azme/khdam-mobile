import { loginSchema } from '@/features/auth/schemas/login-schema';

import { buildLoginPayload } from './build-login-payload';

describe('login payload', () => {
  it('validates and builds a phone login payload', () => {
    const values = loginSchema.parse({
      loginType: 'phone',
      countryId: '965',
      phone: '55512345',
      email: '',
      password: 'secret',
    });
    expect(buildLoginPayload(values)).toEqual({
      login_type: 'phone',
      country_id: 965,
      phone: '55512345',
      password: 'secret',
    });
  });

  it('rejects an invalid email login', () => {
    const result = loginSchema.safeParse({
      loginType: 'email',
      countryId: '',
      phone: '',
      email: 'not-an-email',
      password: 'secret',
    });
    expect(result.success).toBe(false);
  });
});
