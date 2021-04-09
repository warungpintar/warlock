import { RequestHandler } from 'express';
import * as O from 'fp-ts/Option';
import { flow } from 'fp-ts/function';
import { app } from '../';
import {
  parseUrl,
  pathTransform,
  parseModule,
  parseModuleMethodHandler,
  parseModulePathHandler,
  transformFieldHandler,
  HttpVerbs,
} from '../utils';

export const resolverMiddleware: RequestHandler = (req, res, next) => {
  const maybeUrl = parseUrl(req.path.slice(1));

  O.fold(next, (url: URL) => {
    const config: any = app.get('config');
    const proxyData = res.locals ?? {};

    const pathModifier = flow(
      parseModule(url),
      O.chain(parseModulePathHandler(url)),
      O.chain(parseModuleMethodHandler(req.method.toLowerCase() as HttpVerbs)),
      O.map(transformFieldHandler({ req, res })),
      O.fold(
        () => undefined,
        (val) => {
          res.status(200);
          return val;
        },
      ),
    )(config?.rest?.sources);

    res.locals = pathTransform(proxyData, { modifier: pathModifier });
    next();
  })(maybeUrl);
};
