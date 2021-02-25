import LRU from 'lru-cache';
import { getGetRequest, hasGetRequest, setGetRequest, ICacheDependency } from '../src/libs/cache'
import { toError } from 'fp-ts/lib/Either';
import { tryCatch, right } from 'fp-ts/lib/IOEither';
import * as O from 'fp-ts/Option'

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
    const get = tryCatch(getGetRequest(new URL('https://example.com?foo=bar&john=doe'))(cacheInstance), toError);
    expect(get()).toStrictEqual(right(expectation)());
  });

  it('should match expectation to get from cache with different url\'s search params order', () => {
    const get = tryCatch(getGetRequest(new URL('https://example.com?foo=bar&john=doe'))(cacheInstance), toError);
    expect(get()).toStrictEqual(right(expectation)());
  });

  it('should match expectation to check from cache with same url\'s search params order', () => {
    const get = tryCatch(hasGetRequest(new URL('https://example.com?john=doe&foo=bar'))(cacheInstance), toError);
    expect(get()).toEqual(right(true)());
  });

  it('should match expectation to check from cache with same url\'s search params order', () => {
    const get = tryCatch(hasGetRequest(new URL('https://example.com?foo=bar&john=doe&lorem=ipsum'))(cacheInstance), toError);
    expect(get()).toEqual(right(false)());
  });
});
