import app from './app';
import coreMiddleware from './coreMiddleware';
import resolverMiddleware from './resolverMiddleware';
import { Config } from '../types';

app.use(coreMiddleware);
app.use(resolverMiddleware);
app.use((_, res) => {
  res.send(res.locals);
});

interface IRun {
  port: number;
  config: Config;
}

export const run = ({ port, config }: IRun) => {
  app.set('config', config);

  app.listen(port, () => {
    console.log(`listening at port: ${port}`);
  });
};
