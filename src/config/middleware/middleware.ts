import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle asynchronous route handlers.
 * It catches errors thrown by the handler and passes them to the next middleware.
 *
 * @param {(req: Request, res: Response) => unknown | Promise<unknown>} handler - The route handler function to be wrapped.
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} - A middleware function that handles the request and response.
 */

export const middleware = (
  // eslint-disable-next-line no-unused-vars
  handler: (req: Request, res: Response) => unknown | Promise<unknown>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
      next();
    } catch (err) {
      next(err);
    }
  };
};
