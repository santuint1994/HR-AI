import { Request, Response, NextFunction } from 'express';
import { IStatusError } from 'types';
import { isCelebrateError } from 'celebrate';

/**
 * Global error handler for the application.
 * Logs and responds to errors, categorizing them by type.
 */
export const globalErrorHandler = (
  err: Error | IStatusError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    return next(err);
  }

  const e = err as IStatusError;
  let status = e.statusCode ?? e.status ?? 500;

  // const translate = typeof res.__ === 'function' ? res.__.bind(res) : (msg: string) => msg;

  let message: string | string[] = err.message || 'serverError';

  /**
   * ✅ Handle Joi/Celebrate validation errors
   */
  if (isCelebrateError(err)) {
    status = 400;

    const errorMessages: string[] = [];

    // celebrate groups errors by segment (e.g., body, query)
    for (const [, joiError] of err.details) {
      joiError.details.forEach((d) => errorMessages.push(d.message));
    }

    message = errorMessages.length === 1 ? errorMessages[0] : errorMessages;
  }

  res.locals.error = message;
  res.locals.stack = err.stack;

  const translatedMessage = Array.isArray(message)
    ? message.map((msg) => res.__(msg))
    : res.__(message);

  res.status(status).json({
    error: translatedMessage,
    timestamp: new Date().toISOString(),
  });
};
