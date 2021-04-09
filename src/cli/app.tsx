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
import { RestEvent } from '../libs';
import { cleanup } from '../';

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
      cleanup();
    }

    if (input === 'p') {
      event.emit('purge');
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
        <Text color="blueBright">running at port {process.env.PORT}</Text>
        <Text color="yellowBright">
          open web interface at http://localhost:{process.env.PORT}/config
        </Text>
        <Text color="blueBright">press `p` to purge cache</Text>
        <Text color="blueBright">press `q` to exit</Text>
      </Box>
    </Box>
  );
};

program
  .command('serve')
  .description('serve warlock project')
  .option('-c, --config <config>', 'specify config path')
  .option('-p, --port <port>', 'specify port')
  .option('-ni, --non-interactive', 'do not show interactive interface')
  .action(({ config, port, nonInteractive }) => {
    const _port = port ?? 4000;
    process.env.PORT = _port;
    runServer(config, _port);

    if (!nonInteractive) {
      render(<App />);
    }
  });

program.parse(process.argv);
