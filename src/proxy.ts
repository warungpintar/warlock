import Router, { IMiddleware as Middleware } from 'koa-router';
import R from 'ramda';

import ServerError from './libs/ServerError';
// @TODO  {httpClient}
// import { createHttpClient } from './libs/httpClient';

const router = new Router();

const removeFirstSlash = (str: string) => str.replace(/^\/|\/$/g, '');
const stringToURL = (str: string) => new URL(str);
let targetService: URL | null = null;
const resolveProxyContext: Middleware = async (ctx, next) => {
  targetService = R.compose(stringToURL, removeFirstSlash)(ctx.path);
  ctx.request.url = `${targetService.origin}${targetService.pathname}`;
  await next();
};

router
  .prefix('/')
  .use(resolveProxyContext)
  .all('*', async (ctx) => {
    // @TODO  {httpClient}
    // const reqOptions = {
    //   baseURL: targetService?.origin,
    //   url: targetService?.pathname,
    //   method: ctx.request.method,
    //   // headers: ctx.header,
    //   // body: qs.stringify(ctx.request.body),
    //   // qs: ctx.request.query
    // };

    // const httpClient = createHttpClient(ctx.warmock.config, reqOptions, ctx);

    try {
      // @TODO const result = await httpClient(reqOptions);
      ctx.status = 200;
      // @TODO ctx.body = result.data;
      ctx.body = { todo: 'HANDLE httpCLient' };
    } catch (error) {
      console.log('<<< error');
      console.log(error);
      throw new ServerError(400, error);
    }

    // @TODO: serve graphql (proxy the request to graphql-mesh server)
  });

export default router.routes();
