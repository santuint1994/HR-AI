import { controller } from '@config/controller/controller';
import { candidateService } from '@services/index';
import { Request, Response } from 'express';

export const listCandidatesHandler = controller(
  async (_req: Request, res: Response): Promise<void> => {
    const candidates = await candidateService.listCandidates();
    res.json(candidates);
  },
);

