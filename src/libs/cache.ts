import { Reader } from 'fp-ts/lib/Reader';
import { pipe } from 'fp-ts/lib/pipeable';
import { IO } from 'fp-ts/lib/IO';
import * as E from 'fp-ts/Either';
import { fromNullable, Option } from 'fp-ts/lib/Option';

import { sortURLSearchParams } from '../utils/url';
import { toString, hashStr } from '../utils/generic';

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

export interface ICache {
  setItem: <T>(key: string, value: unknown) => E.Either<unknown, T>;
  getItem: <T>(key: string) => E.Either<unknown, T>;
}

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
  pipe(sortURLSearchParams(url), toString, hashStr, (key) => (deps) =>
    getItem(key)(deps),
  );

export const hasGetRequest = (url: URL) =>
  pipe(sortURLSearchParams(url), toString, hashStr, hasItem);

export const setGetRequest = (url: URL, responsePayload: string) =>
  pipe(sortURLSearchParams(url), toString, hashStr, (key) => (deps) =>
    setItem(key, responsePayload)(deps),
  );
