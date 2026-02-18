import { Router } from 'express';

import { cvParseRouter } from './cv-parse';
import { interviewRouter } from './interview';
import { candidateRouter } from './candidate';
import { authRouter } from './auth';
import { userRouter } from './user';

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/user', userRouter);
v1Router.use('/cv-parse', cvParseRouter);
v1Router.use('/interview', interviewRouter);
v1Router.use('/candidate', candidateRouter);

export { v1Router };
