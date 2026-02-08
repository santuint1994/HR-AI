import { Router } from 'express';

import { cvParseRouter } from './cv-parse';

const v1Router = Router();

v1Router.use('/cv-parse', cvParseRouter);

export { v1Router };
