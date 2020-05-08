jest.mock('request-promise-native');
jest.setTimeout(1000 * 30);

const { Crawler, Product, validators } = require('../src/crawler');

const { AppError } = require('../src/errors');

describe('crawler module', () => {
  const mock = {
    query: {
      search: {
        undefined: { limit: 10 },
        number: { search: 123, limit: 10 },
        boolean: { search: true, limit: 10 },
        regex: { search: /\w/, limit: 10 },
        object: { search: {}, limit: 10 },
      },
      limit: {
        undefined: { search: 'bola' },
        string: { search: 'bola', limit: 'asd' },
        boolean: { search: 'bola', limit: true },
        regex: { search: 'bola', limit: /[0-9]/ },
        object: { search: 'bola', limit: {} },
        negative: { search: 'bola', limit: -1 },
        zero: { search: 'bola', limit: -1 },
        float: { search: 'bola', limit: 10.5 },
      },
    },
    proxy: {
      valid: { query: { search: 'b' }, proxy: 'http://0.0.0.0:12345' },
      invalid: {
        protocol: { query: { search: 'b' }, proxy: '0.0.0.0:123456' },
        port: { query: { search: 'b' }, proxy: 'http://0.0.0.0:123456' },
      },
    },
  };

  describe('validators', () => {
    test(
      'when I submit a search, an error is expected to be sent if the search ' +
      'is not valid',
      () => {
        const fn = (q) => () => validators.postSearch(q);

        // search is required
        expect(fn(mock.query.search.undefined)).toThrow(AppError);
        // search must be a string
        expect(fn(mock.query.search.number)).toThrow(AppError);
        expect(fn(mock.query.search.boolean)).toThrow(AppError);
        expect(fn(mock.query.search.regex)).toThrow(AppError);
        expect(fn(mock.query.search.object)).toThrow(AppError);
        // limit by default is 50 if not send
        expect(mock.query.limit.undefined).toBeTruthy();
        // limit must be a positive integer
        expect(fn(mock.query.limit.string)).toThrow(AppError);
        expect(fn(mock.query.limit.boolean)).toThrow(AppError);
        expect(fn(mock.query.limit.regex)).toThrow(AppError);
        expect(fn(mock.query.limit.object)).toThrow(AppError);
        expect(fn(mock.query.limit.negative)).toThrow(AppError);
        expect(fn(mock.query.limit.zero)).toThrow(AppError);
        expect(fn(mock.query.limit.float)).toThrow(AppError);
      });
  });

  describe('crawler', () => {
    test(
      'when I instantiate a crawler, it is expected that I have a valid ' +
      'query and, if necessary a proxy, that this is a valid url',
      () => {
        const fn = (args) => () => new Crawler(args);

        // query.search is required
        expect(fn({ query: mock.query.search.undefined })).toThrow(AppError);
        // query.search must be a string
        expect(fn({ query: mock.query.search.number })).toThrow(AppError);
        expect(fn({ query: mock.query.search.boolean })).toThrow(AppError);
        expect(fn({ query: mock.query.search.regex })).toThrow(AppError);
        expect(fn({ query: mock.query.search.object })).toThrow(AppError);
        // query.limit by default is 50 if not send
        expect(fn({ query: mock.query.limit.undefined })).toBeTruthy();
        // query.limit must be a positive integer
        expect(fn({ query: mock.query.limit.string })).toThrow(AppError);
        expect(fn({ query: mock.query.limit.boolean })).toThrow(AppError);
        expect(fn({ query: mock.query.limit.regex })).toThrow(AppError);
        expect(fn({ query: mock.query.limit.object })).toThrow(AppError);
        expect(fn({ query: mock.query.limit.negative })).toThrow(AppError);
        expect(fn({ query: mock.query.limit.zero })).toThrow(AppError);
        expect(fn({ query: mock.query.limit.float })).toThrow(AppError);
        // proxy must be a valid string url
        expect(fn(mock.proxy.valid)).toBeTruthy();
        expect(fn(mock.proxy.invalid.port)).toThrow(AppError);
        expect(fn(mock.proxy.invalid.protocol)).toThrow(AppError);
      },
    );
    test(
      'when I instantiate a crawler and ask to fetch, I hope it will return ' +
      'the number of records that was passed at its limit', (done) => {
        const limit = 10;
        new Crawler({ query: { search: 'bola', limit } }).run()
          .then((products) => {
            expect(products).toBeInstanceOf(Array);
            expect(products.length).toEqual(limit);
            expect(products[0]).toBeInstanceOf(Product);
            done();
          });
      },
    );
  });
});

