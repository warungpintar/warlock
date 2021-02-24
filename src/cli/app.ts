import path from 'path';
import { program } from 'commander';
import { pipe } from 'fp-ts/function';
import { fold } from 'fp-ts/Either';

import packageJson from '../../package.json';
import { run } from '../express';
import { getConfig } from '../config';

program.name(packageJson.name).version(packageJson.version);

program
  .command('serve')
  .description('serve warlock project')
  .option('-c, --config <config>', 'specify config path')
  .option('-p, --port <port>', 'specify port')
  .action(({ config, port }) => {
    const filePath = path.join(process.cwd(), config ?? '.warlock.yaml');

    pipe(
      getConfig(filePath),
      fold(
        (e) => {
          console.error(e);
        },
        (c) => {
          run({ port: port ?? 4000, config: c });
        },
      ),
    );
  });

program.parse(process.argv);
