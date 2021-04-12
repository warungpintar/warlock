import { Request, Response, RequestHandler } from 'express';
import { renderGraphiQL } from 'graphql-helix';
import { logger } from '../libs';

export const playgroundMiddlewareFactory = ({
  graphqlPath,
}: {
  baseDir: string;
  exampleQuery: string;
  graphqlPath: string;
}): RequestHandler => {
  let defaultQuery$: Promise<string>;
  return function (req: Request, res: Response, next) {
    defaultQuery$ =
      defaultQuery$ ||
      Promise.resolve()
        .then(async () => {
          return '';
        })
        .catch((e) => {
          logger.error(e);
          process.exit(1);
        });
    if (req.query.query) {
      next();
      return;
    }

    defaultQuery$.then((defaultQuery) => {
      res.send(
        `
  <script>
    let fakeStorageObj = {};
    const fakeStorageInstance = {
      getItem(key) {
        return fakeStorageObj[key];
      },
      setItem(key, val) {
        fakeStorageObj[key] = val;
      },
      clear() {
        fakeStorageObj = {};
      },
      key(i) {
        return Object.keys(fakeStorageObj)[i];
      },
      removeItem(key) {
        delete fakeStorageObj[key];
      },
      get length() {
        return Object.keys(fakeStorageObj).length;
      }
    };
    Object.defineProperty(window, 'localStorage', {
      value: fakeStorageInstance,
    });
  </script>` +
          renderGraphiQL({
            defaultQuery,
            endpoint: graphqlPath,
          }),
      );
    });
  };
};
