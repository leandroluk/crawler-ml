const Koa = require('koa');
const Router = require('koa-router');
const { SystemInfo } = require('./info');

/**
 * @param {Koa} app
 * @param {String} prefix
 * @return {Koa}
 */
const systemRouter = (app, prefix = '/@') => {
  const router = new Router({ prefix });

  router.get('/health', async (ctx) => {
    ctx.body = await SystemInfo.new();
  });

  app
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
};

module.exports = {
  systemRouter,
};
