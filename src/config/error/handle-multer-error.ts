import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

export const handleMulterError = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  // If it's not a Multer error, pass it to the next error handler
  if (!(err instanceof multer.MulterError)) {
    return next(err);
  }

  // Handle different Multer error codes
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return res.status(400).send({
        error: 'File size limit exceeded. The maximum allowed size is 5MB.',
        timestamp: new Date().toISOString(),
      });
    case 'LIMIT_UNEXPECTED_FILE':
      return res.status(400).send({
        error: 'Unexpected file field. Please check your form fields.',
        timestamp: new Date().toISOString(),
      });
    default:
      return res.status(400).send({
        error: 'File upload error occurred.',
        timestamp: new Date().toISOString(),
      });
  }
};
