import { Router } from 'express';
import { interviewController } from '@controllers/index';

const interviewRouter = Router();

interviewRouter.post('/generate-interview', interviewController.generateInterviewHandler);

export { interviewRouter };
