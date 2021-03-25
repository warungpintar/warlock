import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as E from 'fp-ts/lib/Either';
import * as IOE from 'fp-ts/lib/IOEither';
import * as F from 'fp-ts/lib/function';
import * as T from './types';
import {
  validate,
  validateString,
  validateRequired,
  validateFqdn,
} from '@warungpintar/ninshu';

const VERB_LIST = ['get', 'post', 'delete', 'patch', 'put'];

const validateUrl = validate((url: string) => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
});

const validateEmptyQs = validate((url: URL) => {
  return !url.search;
});

type ConfigError = {
  problem: string;
  reason: string;
};

const readFileSync = (file: string): IOE.IOEither<Error, string> =>
  IOE.tryCatch(() => fs.readFileSync(file, 'utf8'), E.toError);

const emptyConfig: T.Config = {
  rest: undefined,
  graphql: undefined,
};

const returnValidObjectOrEmptyObject = (val: any): (() => T.Config) => () =>
  typeof val === 'object' ? val : emptyConfig;

const yamlLoad = (
  file: string,
  opts?: yaml.LoadOptions,
): IOE.IOEither<ConfigError[], T.Config> =>
  IOE.tryCatch(
    F.pipe(yaml.load(file, opts), returnValidObjectOrEmptyObject),
    (reason) => [
      {
        problem: file,
        reason: String(reason),
      },
    ],
  );

const validateConfig = (
  config: T.Config,
): E.Either<ConfigError[], T.Config> => {
  const { rest } = config;
  const sources = rest?.sources ?? [];

  const errors = sources.reduce((prev, next) => {
    const origin = next.origin ?? '';
    const transforms = next.transforms ?? {};
    const _origin = origin.replace(/^(http|https):\/\//, '');
    const concatPrev = (e: ConfigError) => {
      prev = [...prev, e];
    };

    // validate origin
    F.flow(
      validateRequired("origin can't be nil"),
      E.chain(validateString('origin should be string')),
      E.chain(validateFqdn('invalid origin')),
      E.mapLeft((e) => {
        concatPrev({ problem: origin ?? 'undefined origin', reason: e });
      }),
    )(_origin);

    // validate path
    Object.keys(transforms).forEach((tpath) => {
      F.flow(
        validateRequired("path can't be nil"),
        E.chain(validateString('path should be string')),
        E.map((val) => origin.concat(val)),
        E.chain(validateUrl('broken origin')),
        E.map((val) => new URL(val)),
        E.chain(validateEmptyQs("path can't contain query string")),
        E.mapLeft((e) => {
          concatPrev({ problem: tpath, reason: e });
        }),
      )(tpath);
    });

    Object.values(transforms).forEach((tval) => {
      const verbs = Object.keys(tval ?? {});
      const verbsHandler = Object.values(tval ?? {});

      // validate verb
      verbs.forEach((verb) => {
        if (!VERB_LIST.includes(verb.toLocaleLowerCase())) {
          concatPrev({
            problem: verb,
            reason: 'only accept '.concat(VERB_LIST.join(', ')),
          });
        }
      });

      // validate handler
      verbsHandler.forEach((handlers: T.WarlockConfig.Field[]) => {
        handlers.forEach((handler) => {
          const parts = handler.field?.split('.') ?? [];
          // @TODO: validate resolver

          if (parts[0] !== 'root') {
            concatPrev({
              problem: handler.field ?? 'undefined field',
              reason: 'field should always starts with root',
            });
          }
        });
      });
    });

    return prev;
  }, [] as ConfigError[]);

  if (errors.length > 0) {
    return E.left(errors);
  }

  return E.right(config);
};

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
    IOE.bimap(() => [{ problem: file, reason: "can't read file" }], yamlLoad),
    IOE.flatten,
  );

  return E.chain(validateConfig)(p());
};

export const getConfigWithDefault = (file: string) => {
  return F.pipe(
    file,
    getConfig,
    E.getOrElseW(() => emptyConfig),
  );
};
