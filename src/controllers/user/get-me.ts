import { controller } from '@config/controller/controller';
import { Request, Response } from 'express';

export const getMeHandler = controller(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.json({
    message: 'Success',
    data: req.user,
  });
});
