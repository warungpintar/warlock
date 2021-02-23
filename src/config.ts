import * as yaml from 'js-yaml';
// import path from 'path';
import * as fs from 'fs';
import * as E from 'fp-ts/lib/Either';
import * as IOE from 'fp-ts/lib/IOEither';
import { pipe } from 'fp-ts/lib/function';
import * as T from './types';
/**
 * TODO : make it utils for this project
 */
const readFileSync = (file: string): IOE.IOEither<Error, string> =>
  IOE.tryCatch(() => fs.readFileSync(file, 'utf8'), E.toError);

const yamlLoad = (
  file: string,
  opts?: yaml.LoadOptions,
): IOE.IOEither<Error, T.Config> =>
  IOE.tryCatch(() => {
    const _default = {
      rest: undefined,
      graphql: undefined,
    };
    const loaded = yaml.load(file, opts);
    switch (typeof loaded) {
      case 'object':
        return loaded ?? _default;
      default:
        return _default;
    }
  }, E.toError);

/**
 * this function return WarlockConfig
 *
 * @example
 * ```ts
 * import {getConfig} from '@warungpintar/warlock'
 *
 * getConfig(filepath) // right when ok left when error
 * ```
 */
export const getConfig = (file: string) => {
  const p = pipe(
    file,
    readFileSync,
    IOE.bimap(E.toError, yamlLoad),
    IOE.flatten,
  );

  return p();
};
