import path from 'path';
import lmdb from 'node-lmdb';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';

import { ICacheDependency } from './cache';
import { createDirIfNotExist, removeDirIfExist } from '../utils/fs';

interface LMDBOptions {
  path: string;
  maxDbs: number;
}
export default class LMDB implements ICacheDependency {
  'env': any;
  'dbi': any;
  'txn': any;
  options: LMDBOptions = {
    maxDbs: 1,
    path: path.join(process.cwd(), '.cache'),
  };

  constructor(overrideOpts?: LMDBOptions) {
    this.options = Object.assign({}, this.options, overrideOpts ?? {});
    this._open();
  }

  public get = (key: string): string => {
    const txn = this.env.beginTxn();
    const data = txn.getString(this.dbi, key);
    txn.commit();
    return data;
  };

  public set = (key: string, value: string): boolean => {
    const txn = this.env.beginTxn();
    txn.putString(this.dbi, key, value);
    txn.commit();
    return true;
  };

  public has = (key: string): boolean => {
    const txn = this.env.beginTxn();
    const data: string = txn.getString(this.dbi, key);
    txn.commit();
    return !!data;
  };

  public close = (): void => {
    this.dbi.close();
    this.env.close();
  };

  public reset = (): E.Either<Error, null> => {
    this.close();
    const maybeRemovedDir = removeDirIfExist(this.options.path)();
    if (maybeRemovedDir._tag === 'Left') {
      return E.left(maybeRemovedDir.left);
    }
    return this._open();
  };

  private _open = (): E.Either<Error, null> => {
    const maybeCreatedDir = createDirIfNotExist(this.options.path)();

    if (maybeCreatedDir._tag === 'Left') {
      return E.left(maybeCreatedDir.left);
    }

    this.env = new lmdb.Env();
    this.env.open(this.options);
    this.dbi = this.env.openDbi({
      name: 'response',
      create: true,
    });

    return E.right(null);
  };
}

export const _createCacheDirectoryThenGeneratePathOptions = (
  cacheDirPath: string,
) => {
  const createdCacheDirPath = createDirIfNotExist(cacheDirPath);

  return pipe(
    createdCacheDirPath(),
    E.map((x) => O.some({ path: x })),
    E.getOrElse(() => O.none),
    O.toUndefined,
  );
};
