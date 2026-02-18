import { controller } from '@config/controller/controller';
import { authService } from '@services/index';
import { authValidation } from '@validations/index';
import { Request, Response } from 'express';
import { StatusError } from '@config/error/status-error';

export const loginHandler = controller(async (req: Request, res: Response): Promise<void> => {
  const { error, value } = authValidation.LoginSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    throw StatusError.badRequest(messages);
  }

  const { email, password } = value;
  const result = await authService.login(email, password);

  res.json({
    message: 'Login successful',
    data: result,
  });
});
