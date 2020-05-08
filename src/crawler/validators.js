const { AppError } = require('../errors');
const errors = require('./errors');

/**
 * @param {Object} args
 * @return {Object}
 */
function postSearch(args) {
  try {
    if (
      // if not search or search isn't a string
      !args.search || typeof args.search !== 'string'
    ) {
      throw errors.validation('search');
    };
    if (
      // if limit is defined
      ![undefined, null].includes(args.limit) &&
      // if limit isn't a number or lower than 1 or an float number
      (typeof args.limit != 'number' || args.limit < 1 || args.limit % 1)
    ) {
      throw errors.validation('limit');
    };
    return args;
  } catch (error) {
    throw new AppError(error);
  }
};

module.exports = {
  postSearch,
};
