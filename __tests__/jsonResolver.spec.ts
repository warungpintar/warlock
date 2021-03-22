import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import request from 'supertest';
import { Config } from '../src/types/config-combine';
import { runForTest } from '../src/express';

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
                    path: './fixtures/path-new-field.resolver.ts',
                  },
                ],
              },
              {
                field: 'root.customField',
                resolvers: [
                  {
                    json: './fixtures/json-resolver.json',
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

const homeDir = os.homedir();
const cachePath = path.join(homeDir, '.warlock-cache');

describe('json resolver', () => {
  beforeAll(() => {
    return Promise.all([fs.rmdir(cachePath, { recursive: true })]);
  });

  const app = runForTest(config);

  it('(MOCKPUBAPI07) should response 200 and cache miss', (done) => {
    request(app)
      .get('/https://pokeapi.co/api/v2/berry/1')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.headers['x-warlock-cache']).toBe('MISS');
        expect(typeof res?.body?.customField).toBe('object');
        done();
      });
  });

  it('(MOCKPUBAPI08) should response 200 and cache hit', (done) => {
    request(app)
      .get('/https://pokeapi.co/api/v2/berry/1')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.headers['x-warlock-cache']).toBe('HIT');
        expect(typeof res?.body?.customField).toBe('object');
        done();
      });
  });
});
