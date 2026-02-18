import bcrypt from 'bcrypt';
import { envs } from '@config/env';

/**
 * Hash a plain text password using bcrypt.
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  const saltRounds = envs.passwordSalt || 10;
  return bcrypt.hash(plainPassword, saltRounds);
};
