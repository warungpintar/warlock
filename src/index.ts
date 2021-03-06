import 'array-flat-polyfill';
import os from 'os';
import path from 'path';
import express from 'express';
import * as E from 'fp-ts/Either';
import * as F from 'fp-ts/function';

import {
  parserMiddleware,
  coreMiddleware,
  resolverMiddleware,
} from './middleware';
import { apiRoutes } from './routes';
import event from './cli/event';
import { IS_TEST_ENV, createCacheInstance } from './libs';
import { buildDirPath } from './utils';
import { WARLOCK_CACHE_DIR_NAME } from './constant';
import { logger } from './libs';
import { Config } from './types';
import { graphqlMiddleware } from './middleware/graphql';

export * from './types';
export const app = express();

const CACHE_PATH = F.pipe(WARLOCK_CACHE_DIR_NAME, buildDirPath(os.homedir()));

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

const init = () => {
  // body parser and multer
  app.use(parserMiddleware);
  app.use('/graphql', graphqlMiddleware(app.get('config')));
  app.use('/', express.static(path.join(__dirname, '../www')));
  app.use('/api', apiRoutes);

  app.use(coreMiddleware(cacheInstance));
  app.use(resolverMiddleware);
  app.use((req, res) => {
    if (typeof res.locals === 'object') {
      res.set('Content-Type', 'application/json; charset=utf-8');
      res.set('Access-Control-Allow-Origin', '*');
    }

    if (!req.url.match(/^\/http/)) {
      res.sendFile(path.join(__dirname, '../www/index.html'));
    } else {
      res.send(res.locals);
    }
  });
};
export const run = ({ port, config }: { port: number; config: Config }) => {
  app.set('config', config);
  init();

  if (IS_TEST_ENV) {
    return app;
  }

  return app.listen(port, () => {
    logger.info(`listening at port: ${port}`);
  });
};

export const cleanup = () => {
  logger.info('shutdown signal is received');
  logger.info('will shutdown in 250ms');

  cacheInstance.close();

  setTimeout(() => {
    logger.info('shutting down...');
    process.exit();
  }, 250);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
