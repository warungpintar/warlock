import app from './app';
import coreMiddleware from './coreMiddleware';
import resolverMiddleware from './resolverMiddleware';
import { Config } from '../types';
import { logger } from '../logger';

import LMDB, { ILMDBCacheDependency } from '../libs/lmdb';

const lmdbInstance: ILMDBCacheDependency = new LMDB();

app.use(coreMiddleware);
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

const cleanup = () => {
  console.info('shutdown signal is received');
  console.info('will shutdown in 5s');

  setTimeout(() => {
    console.info('shutting down...');
    lmdbInstance.close();
    process.exit();
  }, 5000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

run({ port: 3000, config: {} });
