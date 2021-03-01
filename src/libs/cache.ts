import md5 from 'md5';
// https://stackoverflow.com/questions/2722943/is-calculating-an-md5-hash-less-cpu-intensive-than-sha-family-functions
import { Reader } from 'fp-ts/lib/Reader';
import { pipe } from 'fp-ts/lib/pipeable';
import { IO } from 'fp-ts/lib/IO';
import { fromNullable, Option } from 'fp-ts/lib/Option';

import { sortURLSearchParams } from '../utils/url';
import { toString } from '../utils/generic';

// @TODO Cache suppose to be modular, where we can select whether the cache will be stored on the memory, db, or file
// type CacheOption = {
//   store: 'memory' | 'db' | 'file',
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

export const getItem = (
  key: string,
): Reader<ICacheDependency, IO<Option<string>>> => (deps) => () =>
  fromNullable(deps.get(key));

export const hasItem = (key: string): Reader<ICacheDependency, IO<boolean>> => (
  deps,
) => () => deps.has(key);

export const setItem = (
  key: string,
  value: string,
): Reader<ICacheDependency, IO<boolean>> => (deps) => () =>
  deps.set(key, value);

export const getGetRequest = (url: URL) =>
  pipe(sortURLSearchParams(url), toString, hashKey, (key) => (deps) =>
    getItem(key)(deps),
  );

export const hasGetRequest = (url: URL) =>
  pipe(sortURLSearchParams(url), toString, hashKey, hasItem);

export const setGetRequest = (url: URL, responsePayload: string) =>
  pipe(sortURLSearchParams(url), toString, hashKey, (key) => (deps) =>
    setItem(key, responsePayload)(deps),
  );