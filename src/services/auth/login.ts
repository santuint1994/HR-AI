import { signWithHS256 } from '@utils/jwt';
import { userRepository } from '@repositories/index';
import { StatusError } from '@config/error/status-error';
import { verifyPassword } from '@utils/hash-password';

export interface LoginResult {
  token: string;
  user: { id: string; name: string; email: string; phone: string | null };
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw StatusError.unauthorized('Invalid email or password');
  }

  const userData = user.get({ plain: true });

  if (userData.isDeleted) {
    throw StatusError.unauthorized('Account has been deleted');
  }

  if (!userData.isActive) {
    throw StatusError.unauthorized('Account is deactivated');
  }

  const isPasswordValid = await verifyPassword(password, userData.password);
  if (!isPasswordValid) {
    throw StatusError.unauthorized('Invalid email or password');
  }

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
