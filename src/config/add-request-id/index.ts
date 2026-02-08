import { NextFunction, Request, Response } from 'express';
import { randomUUID as uuid4 } from 'crypto';
/**
 * Middleware to add a unique request ID to each incoming request.
 * If the request does not already have an 'x-request-id' header,
 * it generates a new UUID and adds it to the request headers.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} _res - The response object (not used).
 * @param {NextFunction} next - The next middleware function.
 */
export const addRequestId = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.get('x-request-id')) {
    const id = uuid4();
    req.headers['x-request-id'] = id;
  }
  next();
};
