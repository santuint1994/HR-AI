// src/config/module-alias.ts
import * as path from 'path';
import moduleAlias from 'module-alias';

const rootDir = path.resolve(__dirname, '../../../');
const isProd = __dirname.includes('dist');

moduleAlias.addAliases({
  '@config': path.join(rootDir, isProd ? 'dist/config' : 'src/config'),
  '@utils': path.join(rootDir, isProd ? 'dist/utils' : 'src/utils'),
  '@assets': path.join(rootDir, isProd ? 'dist/assets' : 'src/assets'),
  '@controllers': path.join(rootDir, isProd ? 'dist/controllers' : 'src/controllers'),
  '@routes': path.join(rootDir, isProd ? 'dist/routes' : 'src/routes'),
  '@models': path.join(rootDir, isProd ? 'dist/models' : 'src/models'),
  '@services': path.join(rootDir, isProd ? 'dist/services' : 'src/services'),
  '@middlewares': path.join(rootDir, isProd ? 'dist/middlewares' : 'src/middlewares'),
  '@validations': path.join(rootDir, isProd ? 'dist/validations' : 'src/validations'),
  '@types': path.join(rootDir, isProd ? 'dist/types' : 'src/types'),
  '@interfaces': path.join(rootDir, isProd ? 'dist/interfaces' : 'src/interfaces'),
  '@repositories': path.join(rootDir, isProd ? 'dist/repositories' : 'src/repositories'),
  '@docs': path.join(rootDir, isProd ? 'dist/docs' : 'src/docs'),
  '@constants': path.join(rootDir, isProd ? 'dist/constants' : 'src/constants'),
  '@jobs': path.join(rootDir, isProd ? 'dist/jobs' : 'src/jobs'),
  '@events': path.join(rootDir, isProd ? 'dist/events' : 'src/events'),
});
