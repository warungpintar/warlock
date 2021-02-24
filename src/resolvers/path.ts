/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import { flow } from 'fp-ts/function';
import { Request, Response } from 'express';

export type Context = {
  res: Response;
  req: Request;
};

export const pathResolver = (filePath: string, context: Context) =>
  flow((data: any) => {
    const mockFunction = require(path.join(process.cwd(), filePath));
    if (typeof mockFunction === 'function') {
      return mockFunction(data, context);
    }
  });
