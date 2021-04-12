import { RequestHandler } from 'express';
import * as O from 'fp-ts/Option';
import { restMiddleware } from './rest';

import { parseUrl } from '../utils';
import { ICache } from '../libs/cache';

export const coreMiddleware = (cache: ICache): RequestHandler => (
  ...handler
) => {
  const [req, , next] = handler;
  const maybeUrl = parseUrl(req.path.slice(1));

  O.fold(next, (url: URL) => {
    restMiddleware(cache)(url)(...handler);
  })(maybeUrl);
};
