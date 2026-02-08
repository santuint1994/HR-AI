import { isCelebrateError } from 'celebrate'; // Celebrate's error-checking function
import { Request, Response, NextFunction } from 'express';
import { ErrorRequestHandler } from 'express';

export const handleValidationError: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if error is from Celebrate (Joi validation)
  if (isCelebrateError(err)) {
    const status = 400;
    const errorMessages: string[] = [];

    // Extract errors from each segment (e.g., body, query)
    for (const [, joiError] of err.details) {
      joiError.details.forEach((d) => errorMessages.push(d.message)); // Extract Joi validation messages
    }

    // Format response based on the error messages
    const message = errorMessages.length === 1 ? errorMessages[0] : errorMessages;

    return res.status(status).json({
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  // If it's not a Joi/Celebrate error, pass it to the next handler
  next(err);
};
