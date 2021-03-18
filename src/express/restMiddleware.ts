import { RequestHandler } from 'express';
import axios, { Method } from 'axios';
import * as E from 'fp-ts/Either';
import { ICacheDependency } from '../libs/cache';
import { getCacheKey, encode, decode } from '../libs/cacheHttp';
import { concatHeaders } from '../libs/http';
import { logger, debugable } from '../logger';

const instance = axios.create({
  withCredentials: true,
  // all http status code will handled as positive (then) instead of negative (catch)
  // so the proxy can pipe all kind of response.
  validateStatus: () => true,
});

const restMiddleware = (cache: ICacheDependency) => (
  url: URL,
): RequestHandler => (req, res, next) => {
  const cacheKey = getCacheKey(req);
  const responseWithCache = (cacheKey: string) => {
    const cachedResponse = decode(cache.get(cacheKey));
    if (E.isRight(cachedResponse)) {
      const _cachedResponse = cachedResponse.right;
      res.locals = _cachedResponse.data;
      concatHeaders(_cachedResponse.headers)(res);
      res.set('x-warlock-cache', 'HIT');
      debugable(req, _cachedResponse);
      next();
    }
  };

  const isHasCache = cache.has(cacheKey);

  if (isHasCache && req.method.toLocaleLowerCase() === 'get') {
    responseWithCache(cacheKey);
  }

  instance
    .request({
      baseURL: url.origin,
      url: url.pathname.concat(url.search),
      method: req.method as Method,
      headers: {
        ...req.headers,
        'Accept-Encoding': 'deflate',
        host: url.host,
      },
      data: req.body,
    })
    .then((proxyRes) => {
      res.status(proxyRes.status);
      res.locals = proxyRes.data;

      // handle status between 200 and 300
      if (proxyRes.status >= 200 && proxyRes.status < 300) {
        E.fold(
          (e: Error) => {
            logger.error('unable to encode the response for caching');
            logger.error(JSON.stringify(e));
          },
          (data: string) => cache.set(cacheKey, data),
        )(encode(res, proxyRes.headers));
      } else if (req.method.toLocaleLowerCase() !== 'get') {
        responseWithCache(cacheKey);
      }

      if (!res.headersSent) {
        debugable(req, { headers: proxyRes.headers, data: proxyRes.data });
        concatHeaders(proxyRes.headers)(res);
        res.set('x-warlock-cache', 'MISS');
        next();
      }
    })
    .catch((e) => {
      logger.error(JSON.stringify(e));

      if (req.method.toLocaleLowerCase() !== 'get') {
        responseWithCache(cacheKey);
      }
    })
    .finally(next);
};

export default restMiddleware;
