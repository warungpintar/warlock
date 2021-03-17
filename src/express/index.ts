import os from 'os';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';

import app from './app';
import coreMiddleware from './coreMiddleware';
import resolverMiddleware from './resolverMiddleware';
import { Config } from '../types';
import { logger } from '../logger';

import LMDB, { ILMDBCacheDependency } from '../libs/lmdb';
import { buildDirPath, createDirIfNotExist } from '../utils/fs';
import { WARLOCK_CACHE_DIR_NAME } from '../constant';

const CACHE_BASE_PATH = os.homedir();
const concatCachePathWith = buildDirPath(CACHE_BASE_PATH);
const createCacheDir = createDirIfNotExist(
  concatCachePathWith(WARLOCK_CACHE_DIR_NAME),
);

const lmdbOpts = pipe(
  createCacheDir(),
  E.map((x) => O.some({ path: x })),
  E.getOrElse(() => O.none),
  O.toUndefined,
);

const lmdbInstance: ILMDBCacheDependency = new LMDB(lmdbOpts);

app.use(coreMiddleware(lmdbInstance));
app.use(resolverMiddleware);
app.use((_, res) => {
  res.send(res.locals);
});

interface IRun {
  port: number;
  config: Config;
}

export const run = ({ port, config }: IRun) => {
  app.set('config', config);

  return app.listen(port, () => {
    logger.info(`listening at port: ${port}`);
  });
};

export const runForTest = (config: Config) => {
  app.set('config', config);
  return app;
};

const cleanup = () => {
  console.info('shutdown signal is received');
  console.info('will shutdown in 250ms');

  setTimeout(() => {
    console.info('shutting down...');
    lmdbInstance.close();
    process.exit();
  }, 250);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
