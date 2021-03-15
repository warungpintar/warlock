import * as E from 'fp-ts/Either';
import md5 from 'md5';
import { Request, Response } from 'express';
import sortKeys from 'sort-keys';
import qs from 'qs';

import { mergeHeaders } from './http';

export interface IHttpCache {
  headers: Record<string, string>;
  data: any;
}

export const getCacheKey = (req: Request) => {
  const url = new URL(req.url.slice(1));
  const queryObj = qs.parse(url.search.slice(1) ?? '');
  const queryObject = sortKeys(queryObj ?? {});
  const body = sortKeys(req.body ?? {});
  const payload = {
    url: url.origin
      .concat(url.pathname)
      .concat('?')
      .concat(qs.stringify(queryObject)),
    method: req.method,
    body,
  };
  return md5(JSON.stringify(payload));
};

export const encode = (res: Response, additionalHeaders = {}) => {
  const encodedData = JSON.stringify({
    headers: mergeHeaders({})(additionalHeaders),
    data: res.locals,
  });

  return E.right(encodedData);
};

export const decode = (data: string) => {
  try {
    const decodedData = JSON.parse(data);
    return E.right(decodedData as IHttpCache);
  } catch (e) {
    return E.left(new Error(e));
  }
};
