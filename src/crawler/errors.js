module.exports = {
  fetchPage: (page) => ({
    name: 'FetchPage',
    httpCode: 404,
    description: `Cannot fetch page of "${page}"`,
  }),
  slugSearch: (search) => ({
    name: 'slugSearch',
    httpCode: 400,
    description: `Cannot slugify search "${search}"`,
  }),
  validation: (property) => ({
    name: validation,
    httpCode: 400,
    description: `Invalid property "${property}"`,
  }),
};
