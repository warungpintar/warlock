/* eslint-disable */
import lmdb from 'node-lmdb';
import path from 'path';

export default class LMDB {
  'env': any;
  'dbi': any;
  'txn': any;

  constructor() {
    this.env = new lmdb.Env();

    this.env.open({
      path: path.join(__dirname, '../../.cache'),
      maxDbs: 1,
    });

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
}