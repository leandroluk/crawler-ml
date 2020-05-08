const { performance } = require('perf_hooks');
// currently the only functional library that allows the use of a proxy
const request = require('request-promise');
const { JSDOM } = require('jsdom');

const { AppError } = require('../errors');
const { createLogger } = require('../logger');

const errors = require('./errors');

/**
 * the crawler
 */
class Crawler {
  /**
   * @param {Object} props
   */
  constructor(props = {}) {
    // is necessary for the node to allow access to HTTPS pages
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    this.BASE_URL = 'https://lista.mercadolivre.com.br';
    this.pagination = Crawler.LIMIT;
    this.logger = createLogger(this);

    Object.defineProperties(this, {
      _query: { enumerable: false, writable: true, value: {} },
      query: {
        enumerable: true,
        get: () => this._query,
        set: (value) => {
          if (
            // value is required and must be a object
            !(value instanceof Object) ||
            // value must have the search property
            typeof value.search !== 'string' ||
            // if value has the limit property, it must be a positive integer
            (value.limit && (typeof value.limit !== 'number' || value.limit < 1 || value.limit % 1))
          ) {
            throw new AppError(errors.validation('query'));
          }
          this._query = value;
        },
      },
      _proxy: { enumerable: false, writable: true },
      proxy: {
        get: () => this._proxy,
        set: (value) => {
          if (
            // if has proxy
            value && (
              // proxy must be a string
              !(value instanceof String) ||
              // proxy must be a valid proxy url
              !/^(https?:\/\/)(?:[\w-_\.]+)(?:(\:\d{1,5})|)$/i.test(value)
            )
          ) {
            throw new AppError(errors.validation('proxy'));
          }
          this._proxy = value;
        },
      },
    });

    /** @type {{limit: number, search:String}} */
    this.query = { limit: Crawler.LIMIT, ...props.query };
    /** @type {String} */
    this.proxy = props.proxy;
  }

  /**
   * jsonified log for persist with kibana
   * @param {String} type
   * @param {*} body
   */
  log(type, body) {
    this.logger.info({ type: `${this.constructor.name}.${type}`, body });
  }

  /**
   * warpper for http get method
   * @param {String} url
   * @return {Promise<String>}
   */
  async getPage(url) {
    this.log('getPage', url);
    return await request.get(url, {
      // in some cases of constant mass queries it is necessary to use some
      // proxy to not ban the IP
      proxy: this.proxy,
      // used to force the server to send the page as gzip (so we have less
      // content to download)
      gzip: true,
    });
  }

  /**
   * @return {String}
   */
  slugSearch() {
    this.log('slugSearch', this.query.search);
    try {
      const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
      const to = 'aaaaeeeeiiiioooouuuunc------';

      return this.query.search
        // trim string
        .replace(/^\s+|\s+$/g, '')
        // pass to lowercase
        .toLowerCase()
        // split in chars
        .split('')
        // remove acentuation and swap non valid chars to valid
        .map((c, i) => c.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i)))
        // build a new string
        .join('')
        // remove invalid chars
        .replace(/[^a-z0-9 -]/g, '')
        // replace whitespace with '-'
        .replace(/\s+/g, '-')
        // colapse dashes
        .replace(/-+/g, '-');
    } catch (e) {
      throw new AppError(error.slugSearch(this.query.search));
    }
  }

  /**
   * parse value of .price-tag into
   * @param {HTMLSpanElement} priceTag
   * @return {Number}
   */
  parsePrice(priceTag) {
    const tagFraction = priceTag.querySelector('.price__fraction');
    const tagCents = priceTag.querySelector('.price__decimals');

    let price = tagFraction.innerHTML;

    if (tagCents) price += '.' + tagCents.innerHTML;

    price = parseFloat(price);

    return price;
  }

  /**
   * @param {HTMLDivElement} tagCondition
   * @return {String}
   */
  parseState(tagCondition) {
    if (tagCondition) {
      return tagCondition.innerHTML.split(' - ').slice(-1)[0].trim();
    }
  }

  /**
   * @param {HTMLSpanElement} tagBrand
   * @return {String}
   */
  parseStore(tagBrand) {
    if (tagBrand) {
      return tagBrand.getAttribute('data-item-jsurl').split('/').slice(-1)[0];
    }
  }

  /**
   * @return {Number[]}
   */
  buildChunks() {
    let { limit = 50 } = this.query;
    const chunks = [];

    while (limit > 0) {
      chunks.push(limit > this.pagination ?
        this.pagination :
        this.pagination - (this.pagination - limit));
      limit -= this.pagination;
    }

    return chunks;
  }

  /**
   * @param {Number} startAt
   * @return {Number}
   */
  perform(startAt) {
    return (performance.now() - startAt) / 1000;
  }

  /**
   * performs the search but breaks into multiple processes as each page has
   * only {this.pagination} items
   * @return {Promise<Product[]>}
   */
  async run() {
    const startAt = performance.now();
    const chunks = this.buildChunks();

    let products = await Promise.all(chunks.map((max, i) => {
      const offset = this.pagination * i + 1;
      return this.chunkProcess(i, offset, max);
    }));

    products = products.reduce((arr, list) => [...arr, ...list], []);

    this.log('run', { time: this.perform(startAt) });

    return products;
  }

  /**
   * execute the search in one page
   * @param {Number} i
   * @param {Number} offset
   * @param {Number} limit
   * @return {Promise<Product[]>}
   */
  async chunkProcess(i, offset = 0, limit = 50) {
    let products = await this.getProducts(offset);

    // remove limit of size
    products = products.slice(0, limit);

    this.log('chunkProcess', { chunkNumber: i, total: products.length });

    return products;
  }

  /**
   * return a list with products
   * @param {Number} offset
   * @return {Promise<Product[]>}
   */
  async getProducts(offset = 0) {
    const query = [this.slugSearch(), 'Desde', offset].join('_');
    const url = `${this.BASE_URL}/${query}`;

    // retry 3 times with scale sleep in each try
    for (let i = 0; i < 3; i++) {
      try {
        const html = await this.getPage(url);
        const { document } = new JSDOM(html).window;

        const items = [
          ...document.querySelectorAll('#searchResults .results-item'),
        ];

        const products = items.map((item) => {
          return new Product({
            link: item.querySelector('.item__info-title').href,
            name: item.querySelector('.item__info-title').text.trim(),
            price: this.parsePrice(item.querySelector('.item__price')),
            state: this.parseState(item.querySelector('.item__condition')),
            store: this.parseStore(item.querySelector('.item__brand [data-item-jsurl]')),
          });
        });

        return products;
      } catch (e) {
        // if throw error, ignore
      }
      setTimeout(() => null, 2 ** i * 1000);
    }
    throw new AppError(errors.fetchPage('list of products'));
  }
}

// static props
Crawler.LIMIT = 50;


/**
 * the result of each item of list
 */
class Product {
  /**
   * @param {{
   *  name: String,
   *  link: String,
   *  price: Number,
   *  store: String,
   *  state: String
   * }} props
   */
  constructor(props = {}) {
    /** @type {String} */
    this.name = props.name;
    /** @type {String} */
    this.link = props.link;
    /** @type {Number} */
    this.price = props.price;
    /** @type {String} */
    this.store = props.store;
    /** @type {String} */
    this.state = props.state;
  }
}

module.exports = {
  Crawler,
  Product,
};
