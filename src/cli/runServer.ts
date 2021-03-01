import * as esbuild from 'esbuild';
import path from 'path';
import { pipe } from 'fp-ts/function';
import { map, mapLeft } from 'fp-ts/Either';
import ora from 'ora';

import { run } from '../express';
import { getConfig } from '../config';
import { fileWatcher } from './watcher';
import { logger } from '../logger';
import { getPatResolvers } from '../utils';
import { PATH_RESOLVER_DIRECTORI } from '../constant';

const resolverBuilderSpinner = ora('building resolvers');
const restartSpinner = ora('restaring server');

const runServer = (config: string, port: number) => {
  const filePath = path.join(process.cwd(), config ?? '.warlock.yaml');
  pipe(
    getConfig(filePath),
    mapLeft(logger.error),
    map((c) => {
      const pathResolvers: string[] = getPatResolvers(c);

      resolverBuilderSpinner.start();
      console.time(`building ${pathResolvers.length} resolvers`);
      pathResolvers.forEach((resolverPath) => {
        esbuild.buildSync({
          entryPoints: [path.join(process.cwd(), resolverPath)],
          bundle: true,
          minify: true,
          platform: 'node',
          format: 'cjs',
          outfile: path.join(PATH_RESOLVER_DIRECTORI, resolverPath),
        });
      });
      resolverBuilderSpinner.succeed();
      console.timeEnd(`building ${pathResolvers.length} resolvers`);

      const server = run({ port, config: c });

      // watch resolvers
      pathResolvers.forEach((resolverPath) => {
        fileWatcher(() => {
          resolverBuilderSpinner.start();
          esbuild.buildSync({
            entryPoints: [path.join(process.cwd(), resolverPath)],
            bundle: true,
            minify: true,
            platform: 'node',
            format: 'cjs',
            outfile: path.join(PATH_RESOLVER_DIRECTORI, resolverPath),
          });
          resolverBuilderSpinner.succeed();
        })(path.join(process.cwd(), resolverPath));
      });

      // watch config
      fileWatcher(() => {
        restartSpinner.start();
        server.close(() => {
          runServer(config, port);
          restartSpinner.succeed();
        });
      })(filePath);
    }),
  );
};

export default runServer;
