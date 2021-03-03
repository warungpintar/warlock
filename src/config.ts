import * as yaml from 'js-yaml';
// import path from 'path';
import * as fs from 'fs';
import * as E from 'fp-ts/lib/Either';
import * as IOE from 'fp-ts/lib/IOEither';
import * as F from 'fp-ts/lib/function';
import * as T from './types';
/**
 * TODO : make it utils for this project
 */
const readFileSync = (file: string): IOE.IOEither<Error, string> =>
  IOE.tryCatch(() => fs.readFileSync(file, 'utf8'), E.toError);

const emptyConfig: T.Config = {
  rest: undefined,
  graphql: undefined,
};

const yamlLoad = (
  file: string,
  opts?: yaml.LoadOptions,
): IOE.IOEither<Error, T.Config> =>
  IOE.tryCatch(() => {
    const loaded = yaml.load(file, opts);
    switch (typeof loaded) {
      case 'object':
        return loaded ?? emptyConfig;
      default:
        return emptyConfig;
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
  const p = F.pipe(
    file,
    readFileSync,
    IOE.bimap(E.toError, yamlLoad),
    IOE.flatten,
  );

  return p();
};

export const getConfigWithDefault = (file: string) => {
  return F.pipe(
    file,
    getConfig,
    E.getOrElseW(() => emptyConfig),
  );
};
