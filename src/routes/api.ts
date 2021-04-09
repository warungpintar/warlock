import { Router } from 'express';
import { app } from '..';

export const apiRoutes = Router();
const configRouter = Router();

configRouter.get('/', (_, res) => {
  res.json(app.get('config'));
});

apiRoutes.use('/config', configRouter);
