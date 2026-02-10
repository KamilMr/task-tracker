import os from 'os';

const toMB = bytes => Math.round(bytes / 1024 / 1024);

let prevCpuUsage = process.cpuUsage();
let prevTime = Date.now();

const getMemoryUsage = () => {
  const {rss, heapUsed, heapTotal} = process.memoryUsage();
  return {rss: toMB(rss), heapUsed: toMB(heapUsed), heapTotal: toMB(heapTotal)};
};

const getCpuUsage = () => {
  const currentCpu = process.cpuUsage(prevCpuUsage);
  const currentTime = Date.now();
  const elapsed = (currentTime - prevTime) * 1000;
  const cpuPercent =
    elapsed > 0
      ? ((currentCpu.user + currentCpu.system) / elapsed) * 100
      : 0;

  prevCpuUsage = process.cpuUsage();
  prevTime = currentTime;

  return Math.round(cpuPercent * 10) / 10;
};

const getPerformanceSnapshot = () => ({
  ...getMemoryUsage(),
  cpuPercent: getCpuUsage(),
});

export {getMemoryUsage, getCpuUsage, getPerformanceSnapshot};
