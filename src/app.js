'strict';

import cors from '@koa/cors';
import Koa from 'koa';
import koaBody from 'koa-body';
import compress from 'koa-compress';
import morgan from 'koa-morgan';
import { crawlerRouter } from './crawler';
import { systemRouter } from './system';

/**
 * Application class for serve routes
 */
export class App {
  /**
   * async new app for use when need add some async method
   * @param {{
   *  port: String,
   * }} props
   * @return {Promise<App>}
   */
  static async new(props = {}) {
    return new Promise((resolve, reject) => {
      try {
        const app = new App(props);

        app
          .addMiddlewares()
          .addErrorHandling()
          .addRoutes()
          .listen();

        resolve(app);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @param {{
   *  port: String
   * }} props
   */
  constructor(props = {}) {
    /** @type {String} */
    this.port = props.port || 3000;
    /** @type {Koa} */
    this.app = new Koa();
  }

  /**
   * add middlewares
   * @return {App}
   */
  addMiddlewares() {
    this.app
      .use(compress())
      .use(cors())
      .use(morgan('short'))
      .use(koaBody());
    return this;
  }

  /**
   * add error handler
   * @return {App}
   */
  addErrorHandling() {
    this.app.use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        ctx.status = error.httpStatus || 500;
        ctx.body = error;
      }
    });
    return this;
  }

  /**
   * add routes
   * @return {App}
   */
  addRoutes() {
    systemRouter(this.app);
    crawlerRouter(this.app);
    return this;
  }

  /**
   * start application listen on port
   */
  listen() {
    this.app.listen(this.port, () => {
      console.log(`running on port ${this.port}`);
    });
  }
}

// add routes
