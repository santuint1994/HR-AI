import { User } from '@models/index';

export const findUserByEmail = async (email: string) => {
  const user = await User.findOne({
    where: { email: email.toLowerCase().trim() },
  });
  return user;
};
