import { Request, Response, NextFunction } from 'express';

/**
 * Controller wrapper to handle errors in route handlers.
 * This function takes a handler function and returns a new function
 * that catches errors and passes them to the next middleware.
 *
 * @param {(req: Request, res: Response) => Promise<void> | void} handler - The route handler function.
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} - A new function that wraps the handler with error handling.
 */
// eslint-disable-next-line no-unused-vars
export const controller = (handler: (req: Request, res: Response) => Promise<void> | void) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (err) {
      next(err);
    }
  };
};
