jest.mock('request-promise-native');

const supertest = require('supertest');

const { App } = require('../src/app');

describe('app.js', () => {
  test(
    'when I create the application, it should have no errors and must be ' +
    'accessible on the defined port',
    (done) => {
      const args = {
        port: 30000,
      };

      App.new(args).then((app) => {
        expect(app.server).toBeTruthy();
        const request = supertest(app.server);
        request.get('/@/health').then((response) => {
          expect(response).toBeTruthy();
          done();
        });
      });
    });
});

