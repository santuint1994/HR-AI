// import cluster from 'cluster';
// import os from 'os';
import { createApp } from './app';
import { envs } from './config/env';
import './config/env/validate-env';
import { logger } from './config/logger';
import './config/module-alias';

const app = createApp();
// const numCPUs = os.cpus().length;

// if (cluster.isPrimary) {
//   // Fork workers
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
/**
 * Entry point for starting the Express server.
 * Handles environment validation and starts listening on the configured port.
 */

app.listen(envs.port, () => {
  logger.info(`Express server listening on port ${envs.port}`);
});
// }
