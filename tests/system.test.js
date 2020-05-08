jest.mock('request-promise-native');

const {
  CpuInfo, MemoryInfo, DiskInfo, NetworkInfo, SystemInfo,
} = require('../src/system');

describe('system module', () => {
  describe('info', () => {
    test(
      'when I create an instance that contains the system information, it is ' +
      'expected to contain the CPU, Memory, Disk and Network properties in ' +
      'addition to the operating system information',
      (done) => {
        SystemInfo.new().then((res) => {
          expect(res).toBeInstanceOf(SystemInfo);
          expect(res.cpu).toBeInstanceOf(CpuInfo);
          expect(res.memory).toBeInstanceOf(MemoryInfo);
          expect(res.disk).toBeInstanceOf(DiskInfo);
          expect(res.network).toBeInstanceOf(NetworkInfo);
          done();
        });
      });
  });
});
