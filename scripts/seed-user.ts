/**
 * Seed script to create an initial user for testing login.
 * Run: npx ts-node -r tsconfig-paths/register scripts/seed-user.ts
 *
 * Or from project root with env loaded:
 * NODE_ENV=local npx ts-node -r tsconfig-paths/register scripts/seed-user.ts
 */
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
const env = process.env.NODE_ENV || 'local';
const envPath = path.resolve(process.cwd(), `.env.${env}`);
if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else {
  config();
}

// Import after env is loaded
import { sequelize } from '../src/config/database/sql';
import { userRepository } from '../src/repositories/index';

const DEFAULT_EMAIL = 'admin@example.com';
const DEFAULT_PASSWORD = 'Password123!';
const DEFAULT_NAME = 'Admin User';

async function seed() {
  try {
    await sequelize.authenticate();
    const existing = await userRepository.findUserByEmail(DEFAULT_EMAIL);
    if (existing) {
      console.log(`User ${DEFAULT_EMAIL} already exists.`);
      process.exit(0);
      return;
    }
    await userRepository.createUser({
      name: DEFAULT_NAME,
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
      isActive: true,
    });
    console.log(`Created user: ${DEFAULT_EMAIL}`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
