import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import request from 'supertest';
import { Config } from '../src/types/config-combine';
import { runForTest } from '../src/express';

const config: Config = {
  rest: {
    sources: [],
  },
};

const homeDir = os.homedir();
const cachePath = path.join(homeDir, '.warlock-cache');

describe('json resolver', () => {
  beforeAll(() => {
    return Promise.all([fs.rmdir(cachePath, { recursive: true })]);
  });

  const app = runForTest(config);

  it('(PROXPUBAPI01) should response 200 and cache miss', (done) => {
    request(app)
      .get('/https://pokeapi.co/api/v2/berry/1')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.headers['x-warlock-cache']).toBe('MISS');
        expect(res?.body?.id).toBe(1);
        done();
      });
  });

  it('(PROXPUBAPI02) should response 200 and cache hit', (done) => {
    request(app)
      .get('/https://pokeapi.co/api/v2/berry/1')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.headers['x-warlock-cache']).toBe('HIT');
        expect(res?.body?.id).toBe(1);
        done();
      });
  });
});
