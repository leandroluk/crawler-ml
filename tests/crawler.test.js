const {
  Crawler,
  validators,
} = require('../src/crawler');

describe('crawler module', () => {
  describe('validators');
  test(
    'when I insert a search object, the search property is expected to be ' +
    'parseable',
    () => {
      const query = { search: null };
      const crawler = new Crawler();
    });
});
