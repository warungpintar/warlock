import { sortURLSearchParams } from '../src/utils/url';

describe('url utils', () => {
  const data = new URL('https://example.com/api/v1/foo/bar?timestamp=1614050652&john=doe&signature=95532e1350d99b217b5461c67a8ce890263c8316bcd9b872a183f94e41a820d5&foo=bar');

  it('should match expectation', () => {
    const expectation = new URL('https://example.com/api/v1/foo/bar?foo=bar&john=doe&signature=95532e1350d99b217b5461c67a8ce890263c8316bcd9b872a183f94e41a820d5&timestamp=1614050652');
    expect(sortURLSearchParams(data).toString()).toEqual(expectation.toString())
  });
});
