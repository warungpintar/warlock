import os from 'os';
import bodyParser from 'body-parser';
import multer from 'multer';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';

import app from './app';
import coreMiddleware from './coreMiddleware';
import resolverMiddleware from './resolverMiddleware';
import { Config } from '../types';
import { logger } from '../logger';
import event from '../cli/event';

import LMDB, {
  ILMDBCacheDependency,
  _createCacheDirectoryThenGeneratePathOptions,
} from '../libs/lmdb';
import { purgeCache } from '../libs/cache';
import { buildDirPath } from '../utils/fs';
import { safeGet } from '../utils/object';
import { WARLOCK_CACHE_DIR_NAME } from '../constant';

const forms = multer();

const CACHE_BASE_PATH = os.homedir();

const lmdbOpts = pipe(
  WARLOCK_CACHE_DIR_NAME,
  buildDirPath(CACHE_BASE_PATH),
  _createCacheDirectoryThenGeneratePathOptions,
);

const lmdbInstance: ILMDBCacheDependency = new LMDB(lmdbOpts);
const purgeLmdbCache = purgeCache(lmdbOpts)(safeGet('path'));

const purge = () => {
  const onCachePurgeSuccess = () => {
    console.log('Cache purged success!');
  };

  const onCachePurgeFailed = (error: Error) => {
    console.error('Cache failed to purged!');
    console.error(error);
  };

  const purgeCacheHandler = (fn) => {
    E.fold(
      (err: Error) => onCachePurgeFailed(err),
      (result) =>
        result
          ? onCachePurgeSuccess()
          : onCachePurgeFailed(new Error('Unknown')),
    )(fn());
  };

  O.map(purgeCacheHandler)(purgeLmdbCache);
};

event.once('purge', purge);

app.use(forms.any());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(coreMiddleware(lmdbInstance));
app.use(resolverMiddleware);
app.use((_, res) => {
  if (typeof res.locals === 'object' && process.env.NODE_ENV !== 'test') {
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.set('Access-Control-Allow-Origin', '*');
  }

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
  }, 10);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
