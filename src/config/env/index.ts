import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { EnvironmentConfig } from 'types';

// Load environment variables based on NODE_ENV
const loadEnvironment = (): void => {
  const env = process.env.NODE_ENV || 'development'; // default to dev
  const envFilePath = path.resolve(process.cwd(), `.env.${env}`);

  // Pick correct .env file
  if (fs.existsSync(envFilePath)) {
    config({ path: envFilePath });
  } else {
    config();
  }
};

// Load environment variables
loadEnvironment();

// Environment variables configuration
export const envs: EnvironmentConfig = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.NODE_PORT) || 4000,
  passwordSalt: Number(process.env.PASSWORD_SALT_ROUND) || 10,
  jwt: {
    accessToken: {
      secret: process.env.JWT_TOKEN_SECRET || '',
      expiry: Number(process.env.JWT_TOKEN_EXPIRY) || 3600,
    },
    key: {
      private: process.env.JWT_PRIVATE_KEY || '',
      public: process.env.JWT_PUBLIC_KEY || '',
    },
  },
  db: {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    sync: process.env.DB_SYNC === 'true',
    secure: process.env.DB_SECURE === 'true', // Use SSL for database connection
  },
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || '',
};

export default envs;
