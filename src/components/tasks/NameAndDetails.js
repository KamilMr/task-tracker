import React from 'react';
import {Text} from 'ink';
import {formatEstimation} from '../../utils.js';

const NameAndDetails = ({uniqueTask, isSelected, timeDisplay}) => {
  const estimatedMinutes = uniqueTask.estimatedMinutes;
  const estimationDisplay = formatEstimation(estimatedMinutes);
  const estimatedSec = estimatedMinutes ? estimatedMinutes * 60 : null;
  const isOvertime = estimatedSec && uniqueTask.totalSec > estimatedSec;
  const baseColor = isSelected ? 'green' : 'white';
  const timeColor = isOvertime ? 'red' : undefined;

  return (
    <Text key={uniqueTask.title} color={baseColor}>
      {isOvertime && <Text color="red">⚠ </Text>}
      {!isOvertime && (isSelected ? '" ' : '  ')}
      {uniqueTask.title}
      {timeDisplay && (
        <Text dimColor={!isOvertime} color={timeColor}>
          {' '}
          ({timeDisplay}
          {estimationDisplay && ` / ${estimationDisplay}`})
        </Text>
      )}
    </Text>
  );
};

export default NameAndDetails;
