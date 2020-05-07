const axios = require('axios');
const cheerio = require('cheerio');

const { AppError } = require('../errors');
const errors = require('./errors');

/**
 * the crawler
 */
class Crawler {
  /**
   * @param {{
   *  query: { search: String, limit: Number }
   * }} props
   */
  constructor(props = {}) {
    this.BASE_URL = 'https://lista.mercadolivre.com.br';

    /** @type {Object} */
    this.query = props.query || {};
  }

  /**
   * @return {String}
   */
  slugSearch() {
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
        // remove invalid chars
        .replace(/[^a-z0-9 -]/g, '')
        // replace whitespace with '-'
        .replace(/\s+/g, '-')
        // colapse dashes
        .replace(/-+/g, '-');
    } catch (error) {
      throw new AppError(error.normalizeSearch(this.query.search));
    }
  }

  /**
   * @return {Promise<Product[]>}
   */
  async run() {
    const chunkSize = parseInt(this.query.limit / 50) + 1;

    const products = await Promise.all(
      Array(chunkSize).fill(0).map((_, i) => {
        const offset = 50 * i + 1;
        return this.chunkProcess(offset);
      }),
    );

    return products.reduce((arr, list) => [...arr, ...list], []);
  }

  /**
   * @param {Number} offset
   * @return {Promise<Product[]>}
   */
  async chunkProcess(offset = 0) {
    const products = await this.getProducts(offset);
    return await Promise.all(
      products.map((product) => this.addStoreToProduct(product)),
    );
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
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
      } catch (_) { }
      setTimeout(() => null, 2 ** i * 1000);
    }
    throw new AppError(errors.fetchPage('list of products'));
  }

  /**
   * return a store name from product link
   * @param {Product} product
   * @return {Promise<Product>}
   */
  async addStoreToProduct(product) {

  }
}

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
