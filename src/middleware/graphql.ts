import { RequestHandler } from 'express';

export const graphqlMiddleware = (): RequestHandler => async (_, res) => {
  res.json({ message: 'graphql' });
};
