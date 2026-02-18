import { Request, Response, NextFunction } from 'express';
import { verifyWithHS256 } from '@utils/jwt';
import { userRepository } from '@repositories/index';
import { StatusError } from '@config/error/status-error';

interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * Middleware that verifies the Bearer token and attaches the authenticated user to req.user.
 * Expects header: Authorization: Bearer <token>
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw StatusError.unauthorized('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  const decoded = await verifyWithHS256<JwtPayload>(token);
  if (!decoded?.sub) {
    throw StatusError.unauthorized('Invalid token');
  }

  const user = await userRepository.findUserById(decoded.sub);
  if (!user) {
    throw StatusError.unauthorized('User not found');
  }

  const userData = user.get({ plain: true });
  if (userData.isDeleted) {
    throw StatusError.unauthorized('Account has been deleted');
  }
  if (!userData.isActive) {
    throw StatusError.unauthorized('Account is deactivated');
  }

  req.user = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
  };

  next();
};
