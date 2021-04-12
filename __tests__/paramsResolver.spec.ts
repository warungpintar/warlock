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
          '/api/v2/berry/:id/:username': {
            get: [
              {
                field: 'root',
                resolvers: [
                  {
                    path: './fixtures/params-resolver.ts',
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

describe('params resolver', () => {
  beforeAll(() => {
    purgeCache();
  });

  const app = run({ port: 3000, config });

  it('should response 200, return params and cache miss', (done) => {
    request(app)
      .get('/https://pokeapi.co/api/v2/berry/20/johnjohn')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.headers['x-warlock-cache']).toBe('MISS');
        expect(res?.body).toStrictEqual({
          id: '20',
          username: 'johnjohn',
        });
        done();
      });
  });
});
