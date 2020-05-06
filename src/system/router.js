'strict';

import Koa from 'koa';
import Router from 'koa-router';
import { SystemInfo } from './info';

/**
 * @param {Koa} app
 * @param {String} prefix
 * @return {Koa}
 */
export const systemRouter = (app, prefix = '/@') => {
  const router = new Router({ prefix });

  router.get('/health', async (ctx) => {
    ctx.body = await SystemInfo.new();
  });

  app
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
};
