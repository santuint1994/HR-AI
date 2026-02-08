import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import Joi from 'joi';
import { logger } from '@config/logger';

// Environment validation schema
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('local', 'production', 'development', 'test')
    .default('local')
    .required(),
  NODE_PORT: Joi.number().integer().min(1).max(65535).default(4000).required(),
  PASSWORD_SALT_ROUND: Joi.number().integer().min(8).max(20).default(10).required(),
  JWT_TOKEN_SECRET: Joi.string().min(32).required(),
  JWT_TOKEN_EXPIRY: Joi.number().integer().min(1).max(365).default(1).required(),
  JWT_PRIVATE_KEY: Joi.string().min(1).required(),
  JWT_PUBLIC_KEY: Joi.string().min(1).required(),
  GOOGLE_API_KEY: Joi.string().min(10).required(),
  GEMINI_MODEL: Joi.string().min(10).required(),
  DB_DIALECT: Joi.string().valid('postgres').default('postgres').required(),
  DB_HOST: Joi.string().default('localhost').required(),
  DB_PORT: Joi.number().integer().min(1).max(65535).default(5432).required(),
  DB_USER: Joi.string().default('postgres').required(),
  DB_PASSWORD: Joi.string().allow('').default('postgres').required(),
  DB_NAME: Joi.string().default('hr_ai').required(),
  DB_SYNC: Joi.boolean().default(false).required(),
  DB_SECURE: Joi.boolean().default(false).required(),
}).unknown();

// Load environment variables based on NODE_ENV
const loadEnvironment = (): void => {
  const env = process.env.NODE_ENV || 'local';
  const envFilePath = path.resolve(process.cwd(), `.env.${env}`);

  if (fs.existsSync(envFilePath)) {
    config({ path: envFilePath });
    logger.info(`✅ Environment loaded: ${env} from ${envFilePath}`);
  } else {
    config(); // fallback to .env
    logger.warn(`⚠️  .env.${env} not found, using default .env`);
  }
};

// Validate environment variables
const validateEnvironment = (): void => {
  const { error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

  if (error) {
    const errorMessage = error.details
      .map((detail) => `${detail.path.join('.')}: ${detail.message}`)
      .join(', ');

    logger.error(`❌ Environment validation failed: ${errorMessage}`);
    throw new Error(`Environment validation failed: ${errorMessage}`);
  }
};

// Main function to initialize and validate environment
export const initializeEnvironment = (): void => {
  try {
    loadEnvironment();
    validateEnvironment();
  } catch (error) {
    logger.error('❌ Failed to initialize environment:', error);
    process.exit(1);
  }
};

// Auto-initialize when module is imported
initializeEnvironment();

export default initializeEnvironment;
