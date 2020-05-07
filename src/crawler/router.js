const Koa = require('koa');
const Router = require('koa-router');

/**
 * @param {Koa} app
 * @param {String} prefix
 */
const crawlerRouter = async (app, prefix = '/') => {
  const router = new Router({ prefix });

  app
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
};

module.exports = {
  crawlerRouter,
};
