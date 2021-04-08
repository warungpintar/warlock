import path from 'path';
import express from 'express';
import os from 'os';
import bodyParser from 'body-parser';
import multer from 'multer';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';

import coreMiddleware from './coreMiddleware';
import resolverMiddleware from './resolverMiddleware';
import { Config } from '../types';
import { logger } from '../logger';
import event from '../cli/event';
import apiRoutes from './routes/api';

import { createCacheInstance } from '../libs/cache';
import { buildDirPath } from '../utils/fs';
import { WARLOCK_CACHE_DIR_NAME } from '../constant';

const IS_TEST_ENV = process.env.NODE_ENV === 'test';
export const app = express();

const forms = multer();

const CACHE_BASE_PATH = os.homedir();

const CACHE_PATH = pipe(WARLOCK_CACHE_DIR_NAME, buildDirPath(CACHE_BASE_PATH));

const cacheInstance = createCacheInstance(
  IS_TEST_ENV
    ? {
        type: 'memory',
        options: {
          max: 50,
        },
      }
    : {
        type: 'file',
        options: {
          path: CACHE_PATH,
          maxDbs: 1,
        },
      },
);

export const purgeCache = () =>
  E.fold(
    (e) => {
      !IS_TEST_ENV && logger.error(e);
    },
    () => {
      !IS_TEST_ENV && logger.info('cache purged');
    },
  )(cacheInstance.reset());

event.on('purge', purgeCache);

app.use('/', express.static(path.join(__dirname, '../../www')));

app.use(forms.any());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', apiRoutes);

app.use(coreMiddleware(cacheInstance));
app.use(resolverMiddleware);
app.use((_, res) => {
  if (typeof res.locals === 'object' && Object.keys(res.locals).length === 0) {
    return res.sendFile(path.join(__dirname, '../../www/index.html'));
  }

  if (typeof res.locals === 'object' && !IS_TEST_ENV) {
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

export const cleanup = () => {
  console.info('shutdown signal is received');
  console.info('will shutdown in 250ms');

  cacheInstance?.close?.();

  setTimeout(() => {
    console.info('shutting down...');
    process.exit();
  }, 250);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
