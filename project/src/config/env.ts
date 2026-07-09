import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
dotenv.config({ path: '.env.example', override: false });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  MISTRAL_API_KEY: z.string().min(1),
  LOG_LEVEL: z.string().optional().default('info'),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REFRESH_TOKEN: z.string().optional(),
  GOOGLE_SHEET_ID: z.string().optional(),
  GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),
  GOOGLE_INTEGRATION_MOCK: z.preprocess(
    (val) => val === 'true' || val === true || val === '1',
    z.boolean()
  ).optional().default(true),
});

export const env = envSchema.parse(process.env);
