import express from 'express';

import { parserMiddleware } from './middleware';

export * from './types';
export const app = express();

// body parser and multer
app.use(parserMiddleware);
