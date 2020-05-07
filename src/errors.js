/**
 * general app error
 */
class AppError extends Error {
  /**
   * @param {{
   *  name: String,
   *  httpCode: Number,
   *  description: String,
   *  isOperational: Boolean
   * }} props
   */
  constructor(props = {}) {
    super(props.description);

    // restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = props.name;
    this.httpCode = props.httpCode;
    this.isOperational = props.isOperational;

    Error.captureStackTrace(this);
  }
}

module.exports = {
  AppError,
};
