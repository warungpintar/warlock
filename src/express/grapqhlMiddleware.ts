import { RequestHandler } from 'express';

const graphqlMiddleware = (_: URL): RequestHandler => async (_, res) => {
  res.json({ message: 'graphql' });
};

export default graphqlMiddleware;
