import md5 from 'md5';
// https://stackoverflow.com/questions/2722943/is-calculating-an-md5-hash-less-cpu-intensive-than-sha-family-functions
import { Reader } from 'fp-ts/lib/Reader';
import { pipe } from 'fp-ts/lib/pipeable';

import { sortURLSearchParams } from '../utils/url';
import { toString } from '../utils/generic';

// type CacheOption = {
//   store: 'memory' | 'db',
//   max: number,
//   ttl: number,
//   logger: () => void,
// }

export interface ICacheDependency {
  has: (key: string) => boolean;
  get: (key: string) => string;
  set: (key: string, value: string) => boolean;
}

export const hashKey = (payload: string): string => md5(payload);

export const get = (key: string): Reader<ICacheDependency, string> => (
  deps,
) => {
  const value = deps.get(key);
  return value;
};

export const has = (key: string): Reader<ICacheDependency, boolean> => (
  deps,
) => {
  return deps.has(key);
};

export const set = (
  value: string,
  key: string,
): Reader<ICacheDependency, boolean> => (deps) => {
  return deps.set(key, value);
};

export const getGetRequest = (url: URL) => {
  return pipe(sortURLSearchParams(url), toString, hashKey, get);
};

export const hasGetRequest = (url: URL) => {
  return pipe(sortURLSearchParams(url), toString, hashKey, has);
};

export const setGetRequest = (url: URL, responsePayload: string) => {
  return pipe(sortURLSearchParams(url), toString, hashKey, (key) => (deps) =>
    deps.set(key, responsePayload),
  );
};
