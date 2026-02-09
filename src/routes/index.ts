import { Router } from 'express';

import { cvParseRouter } from './cv-parse';
import { interviewRouter } from './interview';

const v1Router = Router();

v1Router.use('/cv-parse', cvParseRouter);
v1Router.use('/interview', interviewRouter);

export { v1Router };
