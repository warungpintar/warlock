import { Router, RequestHandler } from 'express';
import { fork as clusterFork, isMaster } from 'cluster';
import { cpus } from 'os';
import 'json-bigint-patch';
import { Server } from 'http';
import { playgroundMiddlewareFactory } from './playground';
import { graphqlUploadExpress } from 'graphql-upload';
import cors from 'cors';
import { loadFromModuleExportExpression } from '@graphql-mesh/utils';
import { get } from 'lodash';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { graphqlHandler } from './graphql-handler';

import { parseConfig } from '@graphql-mesh/config';
import { getMesh } from '@graphql-mesh/runtime';
import { logger } from '../libs';
import { YamlConfig } from '@graphql-mesh/types';

export async function serveMesh(config: YamlConfig.Config, app: Router) {
  let readyFlag = false;

  const meshConfig = await parseConfig(config);
  const mesh$ = getMesh(meshConfig)
    .then((mesh) => {
      readyFlag = true;
      return mesh;
    })
    .catch((e) => {
      logger.error(e);
      process.exit(1);
    });
  const {
    fork,
    exampleQuery,
    cors: corsConfig,
    handlers,
    staticFiles,
    playground,
    upload: { maxFileSize = 10000000, maxFiles = 10 } = {},
    maxRequestBodySize = '100kb',
    endpoint: graphqlPath = '/graphql',
  } = meshConfig.config.serve || {};

  if (isMaster && fork) {
    const forkNum = fork > 1 ? fork : cpus().length;
    for (let i = 0; i < forkNum; i++) {
      clusterFork();
    }
  } else {
    let httpServer: Server;

    if (corsConfig) {
      app.use(cors(corsConfig));
    }

    app.use(
      bodyParser.json({
        limit: maxRequestBodySize,
      }),
    );
    app.use(cookieParser());

    const pubSubHandler: RequestHandler = (req, _res, next) => {
      Promise.resolve().then(async () => {
        const { pubsub } = await mesh$;
        req['pubsub'] = pubsub;
        next();
      });
    };
    app.use(pubSubHandler);

    const registeredPaths = new Set<string>();
    await Promise.all(
      handlers?.map(async (handlerConfig) => {
        registeredPaths.add(handlerConfig.path);
        if ('handler' in handlerConfig) {
          const handlerFn = await loadFromModuleExportExpression<RequestHandler>(
            handlerConfig.handler,
          );
          app[handlerConfig?.method?.toLowerCase() || 'use'](
            handlerConfig.path,
            handlerFn,
          );
        } else if ('pubsubTopic' in handlerConfig) {
          app.use(handlerConfig.path, (req, res) => {
            let payload = req.body;
            if (handlerConfig.payload) {
              payload = get(payload, handlerConfig.payload);
            }
            req['pubsub'].publish(handlerConfig.pubsubTopic, payload);
            res.end();
          });
        }
      }) || [],
    );

    app.get('/healthcheck', (_req, res) => res.sendStatus(200));
    app.get('/readiness', (_req, res) => res.sendStatus(readyFlag ? 200 : 500));

    app.use(
      '/',
      graphqlUploadExpress({ maxFileSize, maxFiles }),
      graphqlHandler(mesh$),
    );

    if (
      typeof playground !== 'undefined'
        ? playground
        : process.env.NODE_ENV?.toLowerCase() !== 'production'
    ) {
      const playgroundMiddleware = playgroundMiddlewareFactory({
        baseDir: '.',
        exampleQuery: exampleQuery ?? '',
        graphqlPath,
      });
      if (!staticFiles) {
        app.get('/', playgroundMiddleware);
      }
      app.get(graphqlPath, playgroundMiddleware);
    }

    return mesh$.then((mesh) => ({
      mesh,
      httpServer,
      app,
      readyFlag,
      logger,
    }));
  }
  return null;
}
