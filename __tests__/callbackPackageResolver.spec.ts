import request from 'supertest';
import { Config } from '../src/types/config-combine';
import { runForTest, purgeCache } from '../src/express';

const config: Config = {
  rest: {
    sources: [
      {
        name: 'pokeapi',
        origin: 'https://pokeapi.co',
        transforms: {
          '/api/v2/berry/:id': {
            get: [
              {
                field: 'root',
                resolvers: [
                  {
                    path: './fixtures/callback-package-resolver.js',
                  },
                ],
              },
            ],
          },
        },
      },
    ],
  },
};

describe('callback package resolver', () => {
  beforeAll(() => {
    purgeCache();
  });

  const app = runForTest(config);

  it('(MOCKPUBAPI19) should response 200 and cache miss', (done) => {
    request(app)
      .get('/https://pokeapi.co/api/v2/berry/1')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.headers['x-warlock-cache']).toBe('MISS');
        expect(res?.body?.customField).toBe('10 Maret 2026');
        done();
      });
  });

  it('(MOCKPUBAPI20) should response 200 and cache hit', (done) => {
    request(app)
      .get('/https://pokeapi.co/api/v2/berry/1')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.headers['x-warlock-cache']).toBe('HIT');
        expect(res?.body?.customField).toBe('10 Maret 2026');
        done();
      });
  });
});
