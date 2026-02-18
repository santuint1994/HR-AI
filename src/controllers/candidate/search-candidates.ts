import { controller } from '@config/controller/controller';
import { candidateService } from '@services/index';
import { Request, Response } from 'express';
import { StatusError } from '@config/error/status-error';

export const searchCandidatesHandler = controller(
  async (req: Request, res: Response): Promise<void> => {
    // Support both `q` and `search` as query parameter names
    const term = String(req.query.q ?? req.query.search ?? '').trim();


    const rawPage = Number(req.query.page ?? 1);
    const rawLimit = Number(req.query.limit ?? 10);

    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 100 ? Math.floor(rawLimit) : 10;

    const candidates = await candidateService.searchResumes(term, page, limit);
    res.json(candidates);
  },
);

