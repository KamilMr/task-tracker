import React from 'react';
import {Text} from 'ink';
import KeyValue from './KeyValue.js';
import {formatDecimalHoursToHHmm} from '../utils.js';

const fmt = hours => formatDecimalHoursToHHmm(hours);

const WorkTargets = ({breakdown, loading}) => {
  if (loading) return <Text dimColor>Loading...</Text>;
  if (!breakdown) return null;

  const {monthly, today} = breakdown;

  return (
    <KeyValue
      label="Work Targets:"
      items={[
        {key: 'Monthly', value: <Text>{fmt(monthly.worked)}<Text dimColor> / {fmt(monthly.target)}</Text> ({monthly.percentage}%)</Text>},
        {key: 'Today', value: `${fmt(today.worked)} worked`},
        {key: 'Pace', value: <Text color={today.required > today.target ? 'yellow' : 'green'}>~{fmt(today.required)} /wd</Text>},
        {key: 'Target', value: `${fmt(today.target)} /wd`},
        {key: 'Catch up', value: today.catchup > 0
          ? <Text color="red">{fmt(today.catchup)}</Text>
          : <Text color="green">You are on track :-)</Text>},
      ]}
    />
  );
};

export default WorkTargets;
