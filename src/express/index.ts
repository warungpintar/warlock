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

import LMDB, { ILMDBCacheDependency } from '../libs/lmdb';
import { purgeCache } from '../libs/cache';
import { buildDirPath, createDirIfNotExist } from '../utils/fs';
import { safeGet } from '../utils/object';
import { WARLOCK_CACHE_DIR_NAME } from '../constant';

const forms = multer();

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
const purgeLmdbCache = purgeCache(lmdbOpts)(safeGet('path'));

event.once('purge', () => {
  const onCachePurgeSuccess = () => {
    console.log('Cache purged!');
  };

  const onCachePurgeFailed = () => {
    console.log('Cache failed to purged!');
  };

  const purgeCacheHandler = (fn) => {
    console.log('purging cache...');
    E.fold(
      (err) => {
        console.error('Failed to purge cache');
        console.error(err);
      },
      (result) => {
        if (result) {
          return onCachePurgeSuccess();
        }

        return onCachePurgeFailed();
      },
    )(fn());
  };

  E.map(purgeCacheHandler)(purgeLmdbCache);
});

app.use(forms.any());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(coreMiddleware(lmdbInstance));
app.use(resolverMiddleware);
app.use((_, res) => {
  if (typeof res.locals === 'object' && process.env.NODE_ENV !== 'test') {
    res.set('Content-Type', 'text/json; charset=utf-8');
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
