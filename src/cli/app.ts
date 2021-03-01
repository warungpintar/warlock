import { program } from 'commander';
import ora from 'ora';
import runServer from './runServer';

import packageJson from '../../package.json';

const startSpinner = ora('Starting WarLock...');
startSpinner.start();

program.name(packageJson.name).version(packageJson.version);

program
  .command('serve')
  .description('serve warlock project')
  .option('-c, --config <config>', 'specify config path')
  .option('-p, --port <port>', 'specify port')
  .action(({ config, port }) => {
    runServer(config, port ?? 4000);
  });

program.parse(process.argv);
startSpinner.succeed();
