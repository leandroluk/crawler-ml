const { AppError } = require('../errors');
const errors = require('./errors');

/**
 * @param {Object} args
 * @return {Object}
 */
function postSearch(args) {
  try {
    if (!args.search || typeof args.search !== 'string') {
      throw errors.validation('search');
    };
    if (args.limit && (typeof args.limit != 'number' || args.limit <= 0)) {
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
