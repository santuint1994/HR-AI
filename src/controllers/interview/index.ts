import { controller } from '@config/controller/controller';
import { interviewService } from '@services/index';
import { Request, Response } from 'express';

export const generateInterviewHandler = controller(
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body;

    const page = await interviewService.generateInterview(body);

    res.json(page);
  },
);
