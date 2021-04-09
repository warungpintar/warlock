import path from 'path';
import { run } from './';
import { getConfig } from './config';
import * as F from 'fp-ts/function';
import * as E from 'fp-ts/Either';

const configPath = path.join(process.cwd(), '.warlock.yaml');

F.pipe(
  getConfig(configPath),
  E.bimap(
    (err) => {
      throw err;
    },
    (c) => {
      run({ port: 4000, config: c });
    },
  ),
);
