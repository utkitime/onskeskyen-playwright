import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var: ${name}. Add it to ${path.resolve(process.cwd(), '.env')} (see .env.example).`
    );
  }
  return value;
}

export const env = {
  email: process.env.ONSKESKYEN_EMAIL,
  password: process.env.ONSKESKYEN_PASSWORD,
};
