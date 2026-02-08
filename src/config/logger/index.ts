import { envs } from '@config/env';
import { LOG_FOLDER_NAME, LOG_RETENTION_PERIOD } from '@constants/index';
import { sanitizeLog } from '@utils/index';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createLogger, format, transports, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// --- Setup log directory ---
const LOG_FOLDER_PATH = path.join(process.cwd(), LOG_FOLDER_NAME);
if (!fs.existsSync(LOG_FOLDER_PATH)) {
  fs.mkdirSync(LOG_FOLDER_PATH, { recursive: true });
}

// --- Helpers ---
const getEmojiForStatusCode = (statusCode: number): string => {
  if (statusCode >= 200 && statusCode < 300) {
    return { 200: '✅', 201: '✨', 204: '🗑️' }[statusCode] || '👍';
  }
  if (statusCode >= 300 && statusCode < 400) return '➡️';
  if (statusCode >= 400 && statusCode < 500) {
    return { 400: '🚫', 401: '🔑', 403: '🔒', 404: '🔍', 429: '⏳' }[statusCode] || '⚠️';
  }
  if (statusCode >= 500) {
    return { 500: '🔥', 503: '🚧' }[statusCode] || '❌';
  }
  return 'ℹ️';
};

const parseIfJson = (contentType: string | undefined, body: unknown): unknown => {
  if (contentType?.includes('application/json') && typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  return body;
};

// --- Custom log formatter (JSON structured for files) ---
const customLogFormatter = format.printf(({ timestamp, level, message, ...meta }) => {
  const logData: Record<string, unknown> = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...meta,
  };
  if (meta.statusCode) {
    logData.message = `${getEmojiForStatusCode(Number(meta.statusCode))} ${message}`;
  }
  return JSON.stringify(logData);
});

// --- Transport factories ---
const createDailyRotate = (filename: string, level: string = 'info') =>
  new DailyRotateFile({
    level,
    filename: path.join(LOG_FOLDER_PATH, `${filename}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    maxFiles: LOG_RETENTION_PERIOD,
    zippedArchive: true,
  });

// --- Core loggers ---
const logger: Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    customLogFormatter,
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      level: envs.env === 'production' ? 'info' : 'debug',
    }),
    createDailyRotate('combined'),
    createDailyRotate('error', 'error'),
  ],
  exceptionHandlers: [createDailyRotate('exceptions')],
  rejectionHandlers: [createDailyRotate('rejections')],
  exitOnError: false,
});

const accessLogger: Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    customLogFormatter,
  ),
  transports: [
    createDailyRotate('access'),
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(({ timestamp, level, message, ...meta }) => {
          if (meta.type === 'REQUEST') {
            return (
              `${timestamp} [${level}] 🌐 REQUEST: ${message}\n` +
              `➡️ method=${meta.method}, url=${meta.url}, ip=${meta.ip}\n` +
              `➡️ headers=${JSON.stringify(meta.headers)}\n` +
              `➡️ query=${JSON.stringify(meta.query)}\n` +
              `➡️ body=${JSON.stringify(meta.body)}\n`
            );
          }
          if (meta.type === 'RESPONSE') {
            return (
              `${timestamp} [${level}] 📩 RESPONSE: ${message}\n` +
              `⬅️ status=${meta.statusCode}, duration=${meta.responseTimeMs}ms, length=${meta.contentLength}\n` +
              `⬅️ body=${JSON.stringify(meta.responseBody)}\n`
            );
          }
          return `${timestamp} [${level}] ${message}`;
        }),
      ),
    }),
  ],
  exitOnError: false,
});

// --- Express Logging Middleware ---
const logConf = (req: Request, res: Response, next: NextFunction): void => {
  // --- Skip logging for swagger/docs, health checks, static assets ---
  const skipPaths = ['/api-docs', '/swagger', '/docs', '/health', '/favicon.ico', '/static'];
  if (skipPaths.some((p) => req.originalUrl.startsWith(p))) return next();

  const startTime = process.hrtime.bigint();
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;

  // Override res.send to capture response body
  const oldSend = res.send.bind(res);
  res.send = (body?: unknown): Response => {
    const parsedBody = parseIfJson(res.getHeader('content-type')?.toString(), body);
    res.locals.body = sanitizeLog(parsedBody);
    return oldSend(body);
  };

  // Log the incoming request
  accessLogger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
    type: 'REQUEST',
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    headers: sanitizeLog(req.headers),
    query: sanitizeLog(req.query),
    body: sanitizeLog(req.body),
  });

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    const statusCode = res.statusCode;
    const error = res.locals.error as Error | undefined;

    const logData = {
      type: 'RESPONSE',
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      contentLength: res.get('content-length') || 'N/A',
      responseTimeMs: Number(durationMs.toFixed(3)),
      responseBody: error ? { error } : res.locals.body,
      stack:
        envs.env === 'production'
          ? 'Stack trace omitted in production'
          : error?.stack || 'No error stack',
    };

    accessLogger.info(`Response: ${req.method} ${req.originalUrl}`, logData);

    if (statusCode >= 500) {
      logger.error('Internal Server Error', logData);
    } else if (statusCode >= 400) {
      logger.warn('Client Error', { ...logData, stack: undefined });
    }
  });

  next();
};

export { accessLogger, logConf, logger };
