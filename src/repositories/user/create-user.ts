import { User } from '@models/index';
import { hashPassword } from '@utils/hash-password';

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  isActive?: boolean;
}

export const createUser = async (input: CreateUserInput) => {
  const hashedPassword = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase().trim(),
    phone: input.phone ?? null,
    password: hashedPassword,
    isActive: input.isActive ?? true,
    isDeleted: false,
  });
  return user;
};
