import request from 'supertest';
import { Config } from '../src/types/config-combine';
import { run, purgeCache } from '../src';

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
                    json: './fixtures/piping-resolver.json',
                  },
                ],
              },
              {
                field: 'root.customField',
                resolvers: [
                  {
                    path: './fixtures/piping-resolver.js',
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

describe('piping resolver', () => {
  beforeAll(() => {
    purgeCache();
  });

  const app = run({ port: 3000, config });

  it('(MOCKPUBAPI25) should response 200 and cache miss', (done) => {
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

  it('(MOCKPUBAPI26) should response 200 and cache hit', (done) => {
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
