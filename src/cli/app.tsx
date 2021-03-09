import { program } from 'commander';
import React, { useEffect, useState } from 'react';
import { render, useStdout, useInput, Box, Text } from 'ink';
import Table from 'ink-table';
import BigText from 'ink-big-text';
import colorize from 'json-colorizer';
import { format } from 'date-fns';
import runServer from './runServer';
import packageJson from '../../package.json';
import event from './event';
import { RestEvent } from '../logger';

// clear the console
console.clear();

program.name(packageJson.name).version(packageJson.version);

const App = () => {
  const { write } = useStdout();
  const [logStack, setLog] = useState<RestEvent[]>([]);

  const logDetails = (index: number) => {
    write(colorize(JSON.stringify(logStack[index].data, null, 2)) + '\n\n');
  };

  const appendLog = (data: RestEvent) => {
    const newLog = [data, ...logStack];

    if (logStack.length >= 10) {
      newLog.pop();
    }

    setLog(newLog);
  };

  useEffect(() => {
    event.once('show', appendLog);
  }, [logStack]);

  useInput((input) => {
    if (input === 'q') {
      process.exit();
    }

    if (!isNaN(Number(input))) {
      if (logStack[input]) {
        logDetails(+input);
      }
    }
  });

  return (
    <Box flexDirection="column">
      {logStack.length > 0 && (
        <Box flexDirection="column">
          <Box>
            <Text>the last {logStack.length} events</Text>
          </Box>
          <Box>
            <Table
              data={logStack.map((item, idx) => ({
                method: item.method,
                url: item.url?.slice(1),
                timestamp: format(item.timestamp, 'HH:mm:ss:SSS'),
                log: `press ${idx}`,
              }))}
            />
          </Box>
        </Box>
      )}
      <Box flexDirection="column" marginBottom={1}>
        <BigText colors={['#de7106']} font="tiny" text="warlock" />
        <Text color="blueBright">version {packageJson.version}</Text>
        <Text color="blueBright">press `q` to exit</Text>
      </Box>
    </Box>
  );
};

render(<App />);

program
  .command('serve')
  .description('serve warlock project')
  .option('-c, --config <config>', 'specify config path')
  .option('-p, --port <port>', 'specify port')
  .action(({ config, port }) => {
    runServer(config, port ?? 4000);
  });

program.parse(process.argv);
