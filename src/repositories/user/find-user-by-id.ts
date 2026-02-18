import { User } from '@models/index';

export const findUserById = async (id: string) => {
  const user = await User.findByPk(id);
  return user;
};
