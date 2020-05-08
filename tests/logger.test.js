const path = require('path');
const fs = require('fs');

describe('logger.js', () => {
  process.env.LOG_FILE = path.join(__dirname, 'logger.test.js.log');

  afterAll(() => {
    fs.unlinkSync(process.env.LOG_FILE);
  });

  test(
    'when I start the log file and create a named log, it is ' +
    'expected that there is an object inside the log file containing ' +
    'the component name',
    (done) => {
      const { createLogger } = require('../src/logger');

      const logger = createLogger('test');

      logger.info('test');

      expect(fs.existsSync(process.env.LOG_FILE));

      const loggerFile = fs.readFileSync(process.env.LOG_FILE).toString();

      expect(loggerFile).toContain('"component":"test"');

      done();
    },
  );
});
