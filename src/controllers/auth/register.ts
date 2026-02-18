import { controller } from '@config/controller/controller';
import { authService } from '@services/index';
import { authValidation } from '@validations/index';
import { Request, Response } from 'express';
import { StatusError } from '@config/error/status-error';

export const registerHandler = controller(async (req: Request, res: Response): Promise<void> => {
  const { error, value } = authValidation.RegisterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    throw StatusError.badRequest(messages);
  }

  const result = await authService.register(value);

  res.status(201).json({
    message: 'Registration successful',
    data: result,
  });
});
