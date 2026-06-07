import { z } from 'zod';

export const loginSchema = z
  .object({
    loginType: z.enum(['phone', 'email']),
    countryId: z.string(),
    phone: z.string(),
    email: z.string(),
    password: z.string().min(1, 'Password is required'),
  })
  .superRefine((values, context) => {
    if (values.loginType === 'phone') {
      if (!/^\d+$/.test(values.countryId) || Number(values.countryId) <= 0) {
        context.addIssue({ code: 'custom', path: ['countryId'], message: 'Country is required' });
      }
      if (values.phone.trim().length < 5) {
        context.addIssue({ code: 'custom', path: ['phone'], message: 'Enter a valid phone number' });
      }
    } else if (!z.string().email().safeParse(values.email).success) {
      context.addIssue({ code: 'custom', path: ['email'], message: 'Enter a valid email address' });
    }
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
