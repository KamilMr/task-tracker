import React from 'react';
import {Text} from 'ink';

const BAR_WIDTH = 20;

const getPaceColor = (remainingHours, workingDaysLeft) => {
  if (remainingHours <= 0) return 'green';
  const hoursPerDay = workingDaysLeft > 0 ? remainingHours / workingDaysLeft : 0;
  if (hoursPerDay > 10) return 'red';
  if (hoursPerDay > 8) return 'yellow';
  return 'green';
};

const ProgressBar = ({workedHours, targetHours, remainingHours, workingDaysLeft, hoursPerWorkDay}) => {
  const progress = targetHours > 0
    ? Math.min(1, workedHours / targetHours)
    : 0;
  const filled = Math.round(progress * BAR_WIDTH);
  const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
  const percentage = Math.round(progress * 100);
  const color = getPaceColor(remainingHours, workingDaysLeft);

  return (
    <Text>
      <Text color={color}>{bar}</Text>
      {` ${percentage}% ${Math.floor(workedHours)}/${targetHours}h ~${hoursPerWorkDay}h/wd`}
    </Text>
  );
};

export default ProgressBar;
