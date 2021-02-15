const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const yaml = require('js-yaml');

const configContext = require('./middleware/configContext')
const errorHandler = require('./middleware/errorHandler');

try {
  // @TODO: change passing config path by envar to cli arg
  const configFile = process.env.CONFIG_PATH || '.warmock.yaml';
  const configContent = fs.readFileSync(configFile, 'utf8');
  const config = yaml.load(configContent);

  const router = new Router()
  router.use(bodyParser())
  router.use(require('./proxy'))

  const app = new Koa()

  app.use(errorHandler)
  app.use(configContext(config))
  app.use(router.routes())

  app.listen(3001)

} catch (error) {
  if (error.message && error.message.includes('ENOENT: no such file or directory')) {
    console.error('Config file not found')
  } else {
    console.error(error)
  }

  process.exit(1)
}
