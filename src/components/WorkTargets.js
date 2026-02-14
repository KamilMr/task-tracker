import React from 'react';
import {Text, Box} from 'ink';
import KeyValue from './KeyValue.js';
import {formatDecimalHoursToHHmm} from '../utils.js';

const statusColor = (worked, target) => {
  const ratio = target > 0 ? worked / target : 1;
  if (ratio >= 0.9) return 'green';
  if (ratio >= 0.6) return 'yellow';
  return 'red';
};

const fmtH = hours => formatDecimalHoursToHHmm(hours);

const WorkTargets = ({breakdown, loading}) => {
  if (loading) return <Text dimColor>Loading targets...</Text>;
  if (!breakdown) return null;

  const {daily, weekly, monthly} = breakdown;

  return (
    <Box flexDirection="column">
      <KeyValue
        label="Daily:"
        items={[
          {key: 'Target', value: `${fmtH(daily.target)}`},
          {key: 'Required', value: <Text color={daily.required > daily.target ? 'yellow' : 'green'}>{fmtH(daily.required)}</Text>},
          {key: 'Worked', value: <Text color={statusColor(daily.worked, daily.target)}>{fmtH(daily.worked)}</Text>},
          ...(daily.overflow > 0 ? [{key: 'Overflow', value: <Text color="red">+{fmtH(daily.overflow)}</Text>}] : []),
        ]}
      />
      <Box marginTop={1}>
        <KeyValue
          label="Weekly:"
          items={[
            {key: 'Target', value: `${fmtH(weekly.target)}`},
            {key: 'Required', value: <Text color={weekly.required > weekly.target ? 'yellow' : 'green'}>{fmtH(weekly.required)}</Text>},
            {key: 'Worked', value: <Text color={statusColor(weekly.worked, weekly.target)}>{fmtH(weekly.worked)}</Text>},
          ]}
        />
      </Box>
      <Box marginTop={1}>
        <KeyValue
          label="Monthly:"
          items={[
            {key: 'Target', value: `${fmtH(monthly.target)}`},
            {key: 'Worked', value: <Text color={statusColor(monthly.worked, monthly.target)}>{fmtH(monthly.worked)}</Text>},
            {key: 'Remaining', value: <Text color={monthly.remaining > 0 ? 'yellow' : 'green'}>{fmtH(monthly.remaining)}</Text>},
            {key: 'Days Left', value: `${monthly.workingDaysLeft}`},
          ]}
        />
      </Box>
    </Box>
  );
};

export default WorkTargets;
