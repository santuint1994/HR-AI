import { controller } from '@config/controller/controller';
import { candidateService } from '@services/index';
import { Request, Response } from 'express';
import { StatusError } from '@config/error/status-error';

export const getCandidateDetailsHandler = controller(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const candidate = await candidateService.getCandidateById(id);
    if (!candidate) {
      throw StatusError.notFound('candidateNotFound');
    }

    res.json(candidate);
  },
);

