import * as O from 'fp-ts/Option';

import { ICache } from './libs/cache';
import { Config } from './types';

export interface Store {
  config: Config;
  cacheStorage: ICache;
  locals: Record<string, O.Option<unknown>>;
  getLocal: (key: string) => O.Option<unknown>;
}
