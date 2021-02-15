const Router = require('koa-router');
const qs = require('qs');
const R = require('ramda');
const getProxyForUrl = require('proxy-from-env').getProxyForUrl;

const ServerError = require('./libs/ServerError');
const { createHttpClient } = require('./libs/httpClient');

const router = new Router();

const removeFirstSlash = str => str.replace(/^\/|\/$/g, '');
const stringToURL = str => new URL(str);

const resolveProxyContext = async (ctx, next) => {
  ctx.targetService = R.compose(
    stringToURL,
    removeFirstSlash
  )(ctx.path);
  ctx.request.url = `${ctx.targetService.origin}${ctx.targetService.pathname}`
  
  await next();
};

router
  .prefix('/')
  .use(resolveProxyContext)
  .all('*', async ctx => {
    const reqOptions = {
      baseURL: ctx.targetService.origin,
      url: ctx.targetService.pathname,
      method: ctx.request.method,
      // headers: ctx.header,
      // body: qs.stringify(ctx.request.body),
      // qs: ctx.request.query 
    };

    const httpClient = createHttpClient(ctx.warmock.config, reqOptions, ctx)

    try {
      const result = await httpClient(reqOptions)
      ctx.status = 200
      ctx.body = result.data
    } catch (error) {
      console.log('<<< error')
      console.log(error)
      throw new ServerError(400, error);
    }

    // @TODO: serve graphql (proxy the request to graphql-mesh server)
  })

module.exports = router.routes()
