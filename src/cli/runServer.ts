import * as esbuild from 'esbuild';
import path from 'path';
import chalk from 'chalk';
import { pipe } from 'fp-ts/function';
import { bimap } from 'fp-ts/Either';

import { run } from '../express';
import { getConfig } from '../config';
import { fileWatcher } from './watcher';
import { logger } from '../logger';
import { getPatResolvers } from '../utils';
import { PATH_RESOLVER_DIR } from '../constant';

const runServer = (config: string, port: number) => {
  console.clear();
  const filePath = path.join(process.cwd(), config ?? '.warlock.yaml');
  pipe(
    getConfig(filePath),
    bimap(
      (e) => {
        // watch config
        fileWatcher(() => {
          runServer(config, port);
        })(filePath);
        e.forEach((errItem) => {
          logger.error(
            chalk.underline.red(errItem?.problem) +
              ' | ' +
              chalk.yellow(errItem?.reason),
          );
        });
      },
      (c) => {
        const pathResolvers: string[] = getPatResolvers(c);

        console.time(`building ${pathResolvers.length} resolvers`);
        pathResolvers.forEach((resolverPath) => {
          esbuild.buildSync({
            entryPoints: [path.join(process.cwd(), resolverPath)],
            bundle: true,
            minify: true,
            platform: 'node',
            format: 'cjs',
            outfile: path.join(PATH_RESOLVER_DIR, resolverPath),
          });
        });
        logger.info('building resolvers');
        console.timeEnd(`building ${pathResolvers.length} resolvers`);

        const server = run({ port, config: c });

        // watch resolvers
        pathResolvers.forEach((resolverPath) => {
          fileWatcher(() => {
            esbuild.buildSync({
              entryPoints: [path.join(process.cwd(), resolverPath)],
              bundle: true,
              minify: true,
              platform: 'node',
              format: 'cjs',
              outfile: path.join(PATH_RESOLVER_DIR, resolverPath),
            });
            logger.info('restaring server');
          })(path.join(process.cwd(), resolverPath));
        });

        // watch config
        fileWatcher(() => {
          server.close(() => {
            runServer(config, port);
            logger.info('restaring server');
          });
        })(filePath);
      },
    ),
  );
};

export default runServer;
