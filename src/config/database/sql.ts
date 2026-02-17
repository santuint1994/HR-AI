import { envs } from '@config/env';
import { logger } from '@config/logger';
import { Sequelize, Options } from 'sequelize';
import { initModels } from '@models/index';

// const isProduction = envs.env === 'production';

// ✅ Validate and cast dialect
const dialect = envs.db.dialect as Options['dialect'];
if (!dialect) {
  logger.error('❌ Database dialect is not defined in environment variables');
}

// const pool: Options['pool'] = {
//   max: 10,
//   min: 2,
//   acquire: 30000,
//   idle: 10000,
// };

const dialectOptions: Options['dialectOptions'] = envs.db.secure
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : {};

const sequelizeOptions: Options = {
  dialect,
  host: envs.db.host,
  port: Number(envs.db.port),
  database: envs.db.database,
  username: envs.db.username,
  password: envs.db.password,
  dialectOptions,
  // pool: isProduction ? pool : undefined,
  logging: false,
};

export const sequelize = new Sequelize(sequelizeOptions);
// Ensure all models/associations are registered before sync/auth queries run.
initModels(sequelize);

export const connect = async (retries = 3, delay = 2000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      logger.info(`✅ ${dialect} DB connection established.`);

      if (envs.db.sync) {
        await sequelize.sync({ alter: true });
        logger.info('🛠️ Tables sync triggered in development mode.');
      }

      break;
    } catch (error) {
      logger.error(`❌ DB connection attempt ${attempt} failed: ${error}`);

      if (attempt < retries) {
        logger.info(`🔁 Retrying in ${delay}ms... (${retries - attempt} retries left)`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        logger.error('🚨 Max retries reached. Connection failed.');
        throw error;
      }
    }
  }
};
