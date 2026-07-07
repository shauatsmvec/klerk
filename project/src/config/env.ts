import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
dotenv.config({ path: '.env.example', override: false });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  MISTRAL_API_KEY: z.string().min(1),
  LOG_LEVEL: z.string().optional().default('info'),
});

export const env = envSchema.parse(process.env);
