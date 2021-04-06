import { RequestHandler } from 'express';

const graphqlMiddleware = (): RequestHandler => async (_, res) => {
  res.json({ message: 'graphql' });
};

export default graphqlMiddleware;
