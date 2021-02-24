import { RequestHandler } from 'express';
import * as O from 'fp-ts/Option';
import restMiddleware from './restMiddleware';
import graphqlMiddleware from './grapqhlMiddleware';

import { parseUrl } from '../utils';

const coreMiddleware: RequestHandler = (...handler) => {
  const [req, res] = handler;
  const maybeUrl = parseUrl(req.path.slice(1));

  O.fold(
    () => {
      res.status(400).json({
        message: `path: ${req.path} is not handled by any resolvers`,
      });
    },
    (url: URL) => {
      if (url.pathname.includes('/graphql')) {
        graphqlMiddleware(url)(...handler);
      } else {
        restMiddleware(url)(...handler);
      }
    },
  )(maybeUrl);
};

export default coreMiddleware;
