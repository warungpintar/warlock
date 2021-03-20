import lmdb from 'node-lmdb';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';

import { ICacheDependency } from './cache';
import { createDirIfNotExist } from '../utils/fs';

interface LMDBOptions {
  path: string;
  maxDbs: number;
}
export interface ILMDBCacheDependency extends ICacheDependency {
  close: () => void;
}
export default class LMDB {
  'env': any;
  'dbi': any;
  'txn': any;

  constructor(overrideOpts?: LMDBOptions) {
    this.env = new lmdb.Env();
    const defaultOpts = {
      maxDbs: 1, // set as single DB
    };
    const theOpts = Object.assign(defaultOpts, overrideOpts);

    this.env.open(theOpts);

    this.dbi = this.env.openDbi({
      name: 'response',
      create: true,
    });
  }

  public get(key: string): string {
    const txn = this.env.beginTxn();
    const data = txn.getString(this.dbi, key);
    txn.commit();
    return data;
  }

  public set(key: string, value: string): boolean {
    const txn = this.env.beginTxn();
    txn.putString(this.dbi, key, value);
    txn.commit();
    return true;
  }

  public has(key: string): boolean {
    const txn = this.env.beginTxn();
    const data: string = txn.getString(this.dbi, key);
    txn.commit();
    return !!data;
  }

  public close(): void {
    this.dbi.close();
    this.env.close();
  }
}

export const _createCacheDirectoryThenGeneratePathOptions = (cacheDirPath) => {
  const createdCacheDirPath = createDirIfNotExist(cacheDirPath);

  return pipe(
    createdCacheDirPath(),
    E.map((x) => O.some({ path: x })),
    E.getOrElse(() => O.none),
    O.toUndefined,
  );
};
