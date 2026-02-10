import React from 'react';
import {Box, Text} from 'ink';
import usePerformance from '../hooks/usePerformance.js';

const formatDelta = delta => {
  if (!delta || delta === 0) return '';
  const sign = delta > 0 ? '+' : '';
  return ` (${sign}${delta})`;
};

const StatusBar = ({version}) => {
  const {rss, heapUsed, heapTotal, cpuPercent, rssDelta, heapDelta} =
    usePerformance();

  return (
    <Box width="100%" justifyContent="flex-end" gap={1}>
      <Text dimColor>
        RSS: {rss}MB{formatDelta(rssDelta)} | Heap: {heapUsed}/{heapTotal}MB
        {formatDelta(heapDelta)} | CPU: {cpuPercent}% | v{version}
      </Text>
    </Box>
  );
};

export default StatusBar;
