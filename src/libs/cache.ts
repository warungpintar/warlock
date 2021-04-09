import LRU, { LRUOption } from './lru';
import * as E from 'fp-ts/Either';

import LMDB, { LMDBOptions } from './lmdb';

export interface ICache {
  has: (key: string) => boolean;
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => boolean;
  reset: () => E.Either<Error, null>;
  close: () => void;
}

export interface MemoryOption {
  type: 'memory';
  options: LRUOption;
}

export interface FileOption {
  type: 'file';
  options: LMDBOptions;
}

export type CacheOptions = MemoryOption | FileOption;

export const createCacheInstance = (options: CacheOptions): ICache => {
  if (options.type === 'memory') {
    return new LRU(options.options);
  }
  if (options.type === 'file') {
    return new LMDB(options.options);
  }

  return new LRU({ max: 50 });
};
