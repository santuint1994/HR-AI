import { Router } from 'express';
import { cvParseController } from '@controllers/index';
import { upload } from '@config/file-upload/upload';

const cvParseRouter = Router();

cvParseRouter.post(
  '/generate-parse-cv',
  [upload.fields([{ name: 'media', maxCount: 1 }])],
  cvParseController.generateParseCvHandler,
);

cvParseRouter.post(
  '/create-parse-cv',
  cvParseController.createParseCvHandler,
);

export { cvParseRouter };
