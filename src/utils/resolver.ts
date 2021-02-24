import * as O from 'fp-ts/Option';
import { findFirst, reduce } from 'fp-ts/Array';
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

export const parseModulePathHandler = (url: URL) => (module: Module) => {
  if (module.transforms[url.pathname]) {
    return O.some(module.transforms[url.pathname]);
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
