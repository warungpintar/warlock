/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import { flow } from 'fp-ts/function';
import { Request, Response } from 'express';
import { PATH_RESOLVER_DIRECTORI } from '../constant';

export type Context = {
  res: Response;
  req: Request;
};

export const pathResolver = (filePath: string, context: Context) =>
  flow((data: any) => {
    const functionPath = path.join(PATH_RESOLVER_DIRECTORI, filePath);
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete require.cache[functionPath];
    const mockFunction = require(functionPath);

    if (typeof mockFunction === 'function') {
      return mockFunction(data, context);
    }

    if (typeof mockFunction.default === 'function') {
      return mockFunction.default(data, context);
    }
  });
