import { RequestHandler } from 'express';
import * as O from 'fp-ts/Option';
import restMiddleware from './restMiddleware';
import graphqlMiddleware from './grapqhlMiddleware';

import { parseUrl } from '../utils';
import { ICache } from '../libs/cache';

const coreMiddleware = (cache: ICache): RequestHandler => (...handler) => {
  const [req, , next] = handler;
  const maybeUrl = parseUrl(req.path.slice(1));

  O.fold(next, (url: URL) => {
    if (url.pathname.includes('/graphql')) {
      graphqlMiddleware()(...handler);
    } else {
      restMiddleware(cache)(url)(...handler);
    }
  })(maybeUrl);
};

export default coreMiddleware;
