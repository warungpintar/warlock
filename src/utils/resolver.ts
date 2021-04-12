// @ts-nocheck
import * as O from 'fp-ts/Option';
import * as F from 'fp-ts/function';
import { findFirst, reduce } from 'fp-ts/Array';
import UrlPattern from 'url-pattern';
import { Config } from '../types/config-combine';
import {
  fakerResolver,
  jsonResolver,
  pathResolver,
  Context,
} from '../resolvers';

// @TODO: all types will be replaced with generated types from config validator
export type ResolverKey = 'faker' | 'json' | 'path';

export type HttpVerbs = 'get' | 'post' | 'update' | 'patch' | 'put' | 'delete';

export type Resolver = Record<ResolverKey, string>;

export type Resolvers = Resolver[];

export type FieldHandler = {
  field: string;
  resolvers: Resolvers;
};

export type VerbHandler = Record<HttpVerbs, FieldHandler[]>;

export type PathHandler = Record<string, VerbHandler>;

export type Module = {
  name: string;
  origin: string;
  transforms: PathHandler;
};

export const flattenPathHandler = (pathHandler: PathHandler) => {
  return F.flow((data: PathHandler) => {
    return Object.keys(data).map((key) => ({
      key,
      ...data[key],
    }));
  })(pathHandler);
};

export const resolverMapper = (context: Context, rootData: any) => (
  resolvers: Resolvers,
) => {
  const chainResolvers = resolvers.map((resolver) => {
    if (resolver.faker) return fakerResolver(resolver.faker);
    if (resolver.json) return jsonResolver(resolver.json);
    if (resolver.path) return pathResolver(resolver.path, context);

    return (data: any) => {
      return data;
    };
  });

  return chainResolvers.reduce((prev, next: any) => {
    return next(prev);
  }, rootData);
};

export const parseModule = (url: URL) => (config: Module[]) =>
  findFirst((module: Module) => module.origin === url.origin)(config);

export const parseModulePathHandler = (
  url: URL,
  paramsCb?: (params: any) => void,
) => (module: Module) => {
  const pathHandlerKey = Object.keys(module.transforms ?? {}).find((item) => {
    if (item === url.pathname) return true;

    const pattern = new UrlPattern(item);
    const params = pattern.match(url.pathname);

    if (params) {
      if (paramsCb) {
        paramsCb(params);
      }
      return true;
    }

    return false;
  });

  if (pathHandlerKey) {
    return O.some(module.transforms[pathHandlerKey]);
  }

  return O.none;
};

export const parseModuleMethodHandler = (method: HttpVerbs) => (
  handler: VerbHandler,
) => (handler[method] ? O.some(handler[method]) : O.none);

export const transformFieldHandler = (context: Context) => (
  handlers: FieldHandler[],
) => {
  return reduce({}, (prev, next: FieldHandler) => {
    return {
      ...prev,
      [next.field]: (parent: any) =>
        resolverMapper(context, parent)(next.resolvers),
    };
  })(handlers);
};

export const getPatResolvers = (config: Config) => {
  return config.rest?.sources
    ?.map((source) =>
      Object.values(source.transforms ?? {}).reduce((prev, next) => {
        const resolvers = Object.values(next)
          .flat()
          .map((field) => field.resolvers)
          .flat()
          .map((resolver) => resolver?.path)
          .filter(Boolean);
        return [...prev, ...resolvers];
      }, []),
    )
    .flat()
    .reduce((prev, next) => {
      if (prev.includes(next)) {
        return prev;
      }

      return [...prev, next];
    }, []);
};
