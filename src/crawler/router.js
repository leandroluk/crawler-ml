'strict';

import Koa from 'koa';
import Router from 'koa-router';

/**
 * @param {Koa} app
 * @param {String} prefix
 */
export const crawlerRouter = async (app, prefix = '/') => {
  const router = new Router({ prefix });

  app
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
};
