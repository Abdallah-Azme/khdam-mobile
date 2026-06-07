import { z } from 'zod';

const envSchema = z.object({
  apiBaseUrl: z.string().url(),
});

export const env = envSchema.parse({
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
    'https://portal.khdm.net/api',
});
