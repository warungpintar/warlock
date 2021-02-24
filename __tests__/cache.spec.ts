import LRU from 'lru-cache';
import { CACHE_AGE } from '../src/config';
import { getGetRequest, hasGetRequest, setGetRequest, ICacheDependency } from '../src/libs/cache'

const ONE_HOUR = 1000 * 60 * 60;
const cacheAge = CACHE_AGE || ONE_HOUR;
const options = {
  max: 500,
  length: (n, key) => (n * 2) + key.length,
  dispose: (_, n) => n.close(),
  maxAge: cacheAge
};

const cacheInstance: ICacheDependency = new LRU(options);

describe('cache library', () => {
  // prereq step
  const cachedResponsePayload = JSON.stringify({ success: true });
  setGetRequest(new URL('https://example.com?john=doe&foo=bar'), cachedResponsePayload)(cacheInstance);

  const expectation = cachedResponsePayload;

  it('should match expectation to get from cache with same url\'s search params order', () => {
    expect(getGetRequest(new URL('https://example.com?john=doe&foo=bar'))(cacheInstance)).toEqual(expectation)
  });

  it('should match expectation to get from cache with different url\'s search params order', () => {
    expect(getGetRequest(new URL('https://example.com?foo=bar&john=doe'))(cacheInstance)).toEqual(expectation)
  });

  it('should match expectation to check from cache with same url\'s search params order', () => {
    expect(hasGetRequest(new URL('https://example.com?john=doe&foo=bar'))(cacheInstance)).toEqual(true)
  });

  it('should match expectation to check from cache with different url\'s search params order', () => {
    expect(hasGetRequest(new URL('https://example.com?foo=bar&john=doe'))(cacheInstance)).toEqual(true)
  });

  it('should match expectation to check from cache where is not exist', () => {
    expect(hasGetRequest(new URL('https://example.com?foo=bar&john=doe&lorem=ipsum'))(cacheInstance)).toEqual(false)
  });
});
