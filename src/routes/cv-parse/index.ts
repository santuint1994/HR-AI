import { Router } from 'express';
import { cvParseController } from '@controllers/index';
import { upload } from '@config/file-upload/upload';

const cvParseRouter = Router();

cvParseRouter.post(
  '/create-parse-cv',
  [upload.fields([{ name: 'media', maxCount: 1 }])],
  cvParseController.createParseCvHandler,
);

export { cvParseRouter };
