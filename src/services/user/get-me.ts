import { userRepository } from '@repositories/index';
import { StatusError } from '@config/error/status-error';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export const getMe = async (userId: string): Promise<UserProfile> => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw StatusError.unauthorized('User not found');
  }

  const userData = user.get({ plain: true });
  if (userData.isDeleted || !userData.isActive) {
    throw StatusError.unauthorized('Account is not active');
  }

  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
  };
};
