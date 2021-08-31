import { RequestHandler } from 'express';
import axios, { Method } from 'axios';
import ms from 'ms';
import * as E from 'fp-ts/Either';
import { ICache } from '../libs/cache';
import { getCacheKey, encode, decode } from '../libs/cacheHttp';
import { concatHeaders } from '../libs/http';
import { logger, debugable } from '../libs';

const instance = axios.create({
  withCredentials: true,
  timeout: ms('5s'),
  // all http status code will handled as positive (then) instead of negative (catch)
  // so the proxy can pipe all kind of response.
  validateStatus: () => true,
});

export const restMiddleware = (cache: ICache) => (url: URL): RequestHandler => (
  req,
  res,
  next,
) => {
  const cacheKey = getCacheKey(req);
  const responseWithCache = (cacheKey: string) => {
    const cachedResponse = decode(cache.get(cacheKey) ?? '{}');
    if (E.isRight(cachedResponse)) {
      const _cachedResponse = cachedResponse.right;
      res.locals = _cachedResponse?.data;
      concatHeaders(_cachedResponse?.headers ?? {})(res);
      res.set('x-warlock-cache', 'HIT');
      debugable(req, _cachedResponse);
      next();
    } else {
      res.locals = {};
    }
  };

  // handle preflight
  if (req.method?.toLocaleLowerCase() === 'options' && !res.headersSent) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', '*');
    res.set('Access-Control-Allow-Methods', '*');
    return res.end();
  }

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
      res.locals = proxyRes?.data;

      // handle status between 200 and 300
      if (proxyRes.status >= 200 && proxyRes.status < 300) {
        E.fold(
          (e: Error) => {
            logger.error('unable to encode the response for caching');
            logger.error(JSON.stringify(e));
          },
          (data: string) => cache.set(cacheKey, data),
        )(encode(res, proxyRes.headers));
      } else if (req.method.toLocaleLowerCase() !== 'get' && isHasCache) {
        debugable(req, {
          headers: proxyRes.headers,
          data: proxyRes.data,
        });
        responseWithCache(cacheKey);
      }

      res.locals = proxyRes.data;

      if (!res.headersSent) {
        debugable(req, { headers: proxyRes.headers, data: proxyRes.data });
        concatHeaders(proxyRes.headers)(res);
        res.set('x-warlock-cache', 'MISS');
        next();
      }
    })
    .catch((e) => {
      logger.error(JSON.stringify(e));

      if (req.method.toLocaleLowerCase() === 'get') {
        res.locals = {};
        next();
      } else {
        responseWithCache(cacheKey);
      }
    });
};
