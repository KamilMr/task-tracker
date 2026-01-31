import React from 'react';
import {Text} from 'ink';
import {formatEstimation} from '../../utils.js';
import RunningTask from '../RunningTask.js';
import MetadataBadges from './MetadataBadges.js';

const NameAndDetails = ({uniqueTask, isSelected, timeDisplay}) => {
  const estimatedMinutes = uniqueTask.estimatedMinutes;
  const estimationDisplay = formatEstimation(estimatedMinutes);
  const estimatedSec = estimatedMinutes ? estimatedMinutes * 60 : null;
  const isOvertime = estimatedSec && uniqueTask.totalSec > estimatedSec;
  const baseColor = isSelected ? 'green' : 'white';
  const timeColor = isOvertime ? 'red' : undefined;
  const isRunning = uniqueTask.isActive;

  return (
    <Text key={uniqueTask.title} color={baseColor}>
      {isOvertime && <Text color="red">⚠ </Text>}
      {!isOvertime && (isRunning ? '▶ ' : isSelected ? '• ' : '  ')}
      {uniqueTask.title}{' '}
      <Text dimColor={!isOvertime && !isRunning} color={timeColor}>
        (
        {isRunning ? (
          <RunningTask timeSoFar={uniqueTask.totalSec} />
        ) : (
          timeDisplay
        )}
        {estimationDisplay && ` / ${estimationDisplay}`})
      </Text>
      <MetadataBadges
        epic={uniqueTask.epic}
        category={uniqueTask.category}
        isExploration={uniqueTask.isExploration}
        scope={uniqueTask.scope}
        dimmed={!isSelected}
      />
    </Text>
  );
};

export default NameAndDetails;
