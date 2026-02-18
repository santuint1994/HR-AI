import { signWithHS256 } from '@utils/jwt';
import { userRepository } from '@repositories/index';
import { StatusError } from '@config/error/status-error';

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
}

export interface RegisterResult {
  token: string;
  user: { id: string; name: string; email: string; phone: string | null };
}

export const register = async (input: RegisterInput): Promise<RegisterResult> => {
  const existing = await userRepository.findUserByEmail(input.email);
  if (existing) {
    throw StatusError.conflict('Email already registered');
  }

  const user = await userRepository.createUser({
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    password: input.password,
    isActive: true,
  });

  const userData = user.get({ plain: true });
  const token = signWithHS256({
    sub: userData.id,
    email: userData.email,
  });

  return {
    token,
    user: {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
    },
  };
};
