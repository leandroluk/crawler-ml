jest.mock('request-promise-native');

const path = require('path');
const fs = require('fs');

describe('logger.js', () => {
  process.env.LOG_FILE = path.join(__dirname, 'logger_test.log');

  afterAll(() => {
    fs.unlinkSync(process.env.LOG_FILE);
    process.env.LOG_FILE = null;
  });

  test(
    'when I start the log file and create a named log, it is ' +
    'expected that there is an object inside the log file containing ' +
    'the component name',
    () => {
      const { createLogger } = require('../src/logger');

      const logger = createLogger('jest');

      logger.info('jest');

      expect(fs.existsSync(process.env.LOG_FILE));
    },
  );
});
