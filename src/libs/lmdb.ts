import lmdb from 'node-lmdb';
import path from 'path';

import { ICacheDependency } from './cache';

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
      path: path.join(__dirname, '../../.cache'),
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
