import React from 'react';
import {Text, Box} from 'ink';
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

  // Check if we have any time to display (stopped task with 0 time)
  const hasTimeToShow = isRunning || uniqueTask.totalSec > 0;

  return (
    <Box flexDirection="column">
      {/* Line 1: Indicator + Title */}
      <Text color={baseColor} wrap="wrap">
        {isOvertime && <Text color="red">⚠ </Text>}
        {!isOvertime && (isRunning ? '▶ ' : isSelected ? '• ' : '  ')}
        {uniqueTask.title}
      </Text>

      {/* Line 2: Time + Metadata */}
      <Text>
        {'  '}
        {hasTimeToShow && (
          <Text dimColor={!isOvertime && !isRunning} color={timeColor}>
            (
            {isRunning ? (
              <RunningTask timeSoFar={uniqueTask.totalSec} />
            ) : (
              timeDisplay
            )}
            {estimationDisplay && ` / ${estimationDisplay}`})
          </Text>
        )}
        {!hasTimeToShow && estimationDisplay && (
          <Text dimColor>(est: {estimationDisplay})</Text>
        )}
        <MetadataBadges
          epic={uniqueTask.epic}
          category={uniqueTask.category}
          isExploration={uniqueTask.isExploration}
          scope={uniqueTask.scope}
          dimmed={!isSelected}
        />
      </Text>
    </Box>
  );
};

export default NameAndDetails;
