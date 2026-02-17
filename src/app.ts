import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import * as i18n from 'i18n';
import path, { resolve } from 'path';
import { connect as dbConnect } from '@config/database/sql';
import { addRequestId } from '@config/add-request-id';
import { envs } from '@config/env';
import { globalErrorHandler } from '@config/error/handle-error';
import { handleMulterError } from '@config/error/handle-multer-error';
import { StatusError } from '@config/error/status-error';
import { logConf } from '@config/logger';
import { v1Router } from '@routes/index';

const isDev = envs.env === 'development' || envs.env === 'local';
const isProd = envs.env === 'production';

export const createApp = (): Application => {
  const app = express();

  /* ----------------------------- i18n ----------------------------- */
  i18n.configure({
    locales: ['en', 'fr'],
    directory: resolve(__dirname, './assets/locales'),
    defaultLocale: 'en',
    updateFiles: false,
    syncFiles: false,
    objectNotation: true,
    register: global,
  });

  app.use(i18n.init);

  app.use((req, _res, next) => {
    const lang = req.headers['accept-language'];
    if (typeof lang === 'string' && lang.length) {
      req.setLocale(lang.split(',')[0]);
    }
    next();
  });

  /* -------------------------- Security/Core ------------------------- */
  app.disable('x-powered-by');

  // If you're behind a proxy (nginx/heroku), enable this in prod
  // so secure cookies / IP rate-limit works properly.
  if (isProd) app.set('trust proxy', 1);

  // CORS: don’t leave wide open in production
  app.use(cors()); // Enable CORS for cross-origin requests
  // app.use(corsMiddleware);
  // app.options('*', corsMiddleware);

  // Body limits (basic DoS hardening)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(addRequestId);
  app.use(logConf);

  // Connect to SQL database
  // dbConnect();

  // Static uploads - be careful exposing user uploads publicly
  // Consider putting this behind auth or serving via CDN with safe headers.
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  /* ----------------------------- Routes ---------------------------- */
  app.use('/api/v1', v1Router);

  /* ------------------------------ 404 ------------------------------ */
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(StatusError.notFound('routeNotFound'));
  });

  /* -------------------------- Error handlers ------------------------ */
  app.use(handleMulterError);
  app.use(globalErrorHandler);

  return app;
};
