import { z } from 'zod';

export const phoneSchema = z.object({
  countryId: z.string().regex(/^\d+$/, 'Country is required'),
  phone: z.string().min(5, 'Enter a valid phone number'),
});

export const registerSchema = phoneSchema.extend({
  type: z.enum(['1', '2'], { message: 'Choose an account type' }),
});

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{4,6}$/, 'Enter the OTP code'),
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirmation: z.string().min(6, 'Confirm your password'),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Passwords do not match',
  });

export const seekerProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
});

export const officeProfileSchema = seekerProfileSchema.extend({
  stateId: z.string().min(1, 'State is required'),
  mapDesc: z.string().min(1, 'Address is required'),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  whatsapp: z.string().min(5, 'WhatsApp number is required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  nationalNumberManager: z.string().min(12, 'Manager ID is required'),
  phoneManager: z.string().min(5, 'Manager phone is required'),
  description: z.string().min(1, 'Description is required'),
});

export type PhoneFormValues = z.infer<typeof phoneSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
export type SeekerProfileFormValues = z.infer<typeof seekerProfileSchema>;
export type OfficeProfileFormValues = z.infer<typeof officeProfileSchema>;
