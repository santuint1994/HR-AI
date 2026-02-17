import { Router } from 'express';
import { candidateController } from '@controllers/index';

const candidateRouter = Router();

// GET /api/v1/candidate/search?q=term
candidateRouter.get('/search', candidateController.searchCandidatesHandler);

// GET /api/v1/candidate
candidateRouter.get('/', candidateController.listCandidatesHandler);

// GET /api/v1/candidate/:id
candidateRouter.get('/:id', candidateController.getCandidateDetailsHandler);

export { candidateRouter };

