/* eslint-disable */
// @ts-nocheck
// @TODO: use express
import fs from 'fs';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
// import yaml from 'js-yaml';
// import configContext from "./middleware/configContext";
// import errorHandler from "./middleware/errorHandler";
// import proxy from "./proxy.js";

try {
  // @TODO: {parser-config}
  // @TODO: change passing config path by envar to cli arg
  // const configFile = process.env.CONFIG_PATH ?? '.warmock.yaml';
  // const configContent = fs.readFileSync(configFile, 'utf8');
  // const config = yaml.load(configContent);
  const router = new Router();
  router.use(bodyParser());
  // @TODO {proxy} need following @types/koa-bodyparser
  // router.use(proxy);
  const app = new Koa();
  // app.use(errorHandler);
  // app.use(configContext(config));
  app.use(router.routes());
  app.listen(3001);
} catch (error) {
  if (
    error.message &&
    error.message.includes('ENOENT: no such file or directory')
  ) {
    console.error('Config file not found');
  } else {
    console.error(error);
  }

  process.exit(1);
}
