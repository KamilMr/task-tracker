import React from 'react';
import {Text} from 'ink';

const BAR_WIDTH = 20;

const getPaceColor = (hoursPerDay, remainingHours) => {
  if (remainingHours <= 0) return 'green';
  if (hoursPerDay > 10) return 'red';
  if (hoursPerDay > 8) return 'yellow';
  return 'green';
};

const ProgressBar = ({
  workedHours,
  targetHours,
  remainingHours,
  hoursPerWorkDay,
  hoursPerWorkDayRaw,
  overflowHours,
}) => {
  const progress = targetHours > 0 ? Math.min(1, workedHours / targetHours) : 0;
  const filled = Math.round(progress * BAR_WIDTH);
  const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
  const percentage = Math.round(progress * 100);
  const color = getPaceColor(hoursPerWorkDayRaw, remainingHours);
  const overflowPart =
    overflowHours && overflowHours !== '00:00' ? `(+${overflowHours}h)` : '';

  return (
    <Text>
      <Text color={color}>{bar}</Text>
      {` ${percentage}% ${Math.floor(workedHours)}/${targetHours}h ~${hoursPerWorkDay}h${overflowPart}/wd`}
    </Text>
  );
};

export default ProgressBar;
