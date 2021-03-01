import LRU from 'lru-cache';
import { getGetRequest, hasGetRequest, setGetRequest, ICacheDependency } from '../src/libs/cache';
import { pipe, flow } from 'fp-ts/function';
import * as E from 'fp-ts/lib/Either';
import * as IO from 'fp-ts/lib/IOEither';
import * as O from 'fp-ts/Option';

import { safeGet } from '../src/utils/object'
import { strToJson } from '../src/utils/generic'

describe('memory cache library', () => {
  // prereq step
  const ONE_HOUR = `${1000 * 60 * 60}`;
  const cacheAge = parseInt(process.env.CACHE_AGE ?? ONE_HOUR, 10);
  const options = {
    max: 500,
    length: (n, key) => (n * 2) + key.length,
    dispose: (_, n) => n.close(),
    maxAge: cacheAge
  };

  const cacheInstance: ICacheDependency = new LRU(options);
  const cachedResponsePayload = JSON.stringify({ success: true });
  const set = setGetRequest(new URL('https://example.com?john=doe&foo=bar'), cachedResponsePayload)(cacheInstance);
  set();

  const expectation = O.some(cachedResponsePayload);

  it('should match expectation to get from cache with same url\'s search params order', () => {
    const get = IO.tryCatch(getGetRequest(new URL('https://example.com?foo=bar&john=doe'))(cacheInstance), E.toError);
    expect(get()).toStrictEqual(IO.right(expectation)());
  });

  it('should match expectation to get from cache with same url\'s search params order and get the object prop', () => {
    const transformToIoEither = a => IO.ioEither.of(a);

    const getSuccess = pipe(
      IO.tryCatch(getGetRequest(new URL('https://example.com?foo=bar&john=doe'))(cacheInstance), E.toError),
      IO.chain(flow(
        O.map(strToJson),
        O.chain(safeGet('success')),
        transformToIoEither
      ))
    );
    expect(getSuccess()).toStrictEqual(IO.right(O.some(true))());
  });

  it('should match expectation to get from cache with different url\'s search params order', () => {
    const get = IO.tryCatch(getGetRequest(new URL('https://example.com?foo=bar&john=doe'))(cacheInstance), E.toError);
    expect(get()).toStrictEqual(IO.right(expectation)());
  });

  it('should match expectation to check from cache with same url\'s search params order', () => {
    const get = IO.tryCatch(hasGetRequest(new URL('https://example.com?john=doe&foo=bar'))(cacheInstance), E.toError);
    expect(get()).toEqual(IO.right(true)());
  });

  it('should match expectation to check from cache with same url\'s search params order', () => {
    const get = IO.tryCatch(hasGetRequest(new URL('https://example.com?foo=bar&john=doe&lorem=ipsum'))(cacheInstance), E.toError);
    expect(get()).toEqual(IO.right(false)());
  });
});
