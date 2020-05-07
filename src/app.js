const Koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const compress = require('koa-compress');
const morgan = require('koa-morgan');
const { crawlerRouter } = require('./crawler');
const { systemRouter } = require('./system');

/**
 * Application class for serve routes
 */
class App {
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
   * start application listening on port
   */
  listen() {
    this.app.listen(this.port, () => {
      console.log(`running on port ${this.port}`);
    });
  }
}

module.exports = {
  App,
};
