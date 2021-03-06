import { Router } from 'express';
import serveGraphql from '../graphql-mesh/serve';
import { Config } from '../types';

export const graphqlMiddleware = (config: Config) => {
  const router = Router();

  if (config?.graphql) {
    serveGraphql(config?.graphql, router);
  } else {
    router.use((_, res) => {
      res.status(404).json({
        message: "there's no graphql handler in your config",
      });
    });
  }

  return router;
};
