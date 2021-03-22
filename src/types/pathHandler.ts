import { Response, Request } from 'express';

export interface PathContext {
  req: Request;
  res: Response;
}

export type PathHandler = (root: any, context: PathContext) => any;
