import { Router } from 'express';
import { app } from '..';

const router = Router();
const configRouter = Router();

configRouter.get('/', (_, res) => {
  res.json(app.get('config'));
});

router.use('/config', configRouter);

export default router;
