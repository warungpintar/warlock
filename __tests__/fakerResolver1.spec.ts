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
                field: 'root.name',
                resolvers: [
                  {
                    faker: 'name.firstName',
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

describe('faker resolver 1', () => {
  beforeAll(() => {
    purgeCache();
  });

  const app = run({ port: 3000, config });

  it('(MOCKPUBAPI04) should response 200 and cache miss', (done) => {
    request(app)
      .get('/https://pokeapi.co/api/v2/berry/1')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.headers['x-warlock-cache']).toBe('MISS');
        expect(res?.body?.name !== 'cheri').toBe(true);
        expect(typeof res?.body?.name).toBe('string');
        done();
      });
  });

  it('(MOCKPUBAPI05) should response 200 and cache hit', (done) => {
    request(app)
      .get('/https://pokeapi.co/api/v2/berry/1')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.headers['x-warlock-cache']).toBe('HIT');
        expect(res?.body?.name !== 'cheri').toBe(true);
        expect(typeof res?.body?.name).toBe('string');
        done();
      });
  });
});
