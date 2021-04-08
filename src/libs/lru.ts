import LRUBase from 'lru-cache';
import * as E from 'fp-ts/Either';
import { ICache } from './cache';

export interface LRUOption {
  max: number;
}

export default class LRU implements ICache {
  env: LRUBase<string, string>;

  constructor(options: LRUOption) {
    this.env = new LRUBase(options.max);
  }

  public get = (key: string) => {
    return this.env.get(key);
  };

  public set = (key: string, value: string) => {
    return this.env.set(key, value);
  };

  public has = (key: string) => {
    return this.env.has(key);
  };

  public reset = () => {
    this.env.reset();
    return E.right(null);
  };

  public close = () => {
    return null;
  };
}
