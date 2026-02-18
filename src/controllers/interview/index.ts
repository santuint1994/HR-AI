import { controller } from '@config/controller/controller';
import { interviewService } from '@services/index';
import { interviewValidation } from '@validations/index';
import { Request, Response } from 'express';
import { StatusError } from '@config/error/status-error';

export const generateInterviewHandler = controller(
  async (req: Request, res: Response): Promise<void> => {
    const { error, value } = interviewValidation.GenerateInterviewSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      throw StatusError.badRequest(messages);
    }

    const result = await interviewService.generateInterview({
      resumeId: value.resumeId,
      requiredTech: value.requiredTech,
    });

    res.json({
      message: 'Success',
      data: result,
    });
  },
);
