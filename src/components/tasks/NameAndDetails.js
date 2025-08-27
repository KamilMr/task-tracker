import React from 'react';
import {Text} from 'ink';

const NameAndDetails = ({uniqueTask, isSelected, timeDisplay, formatTime}) => {
  return (
    <Text key={uniqueTask.title} color={isSelected ? 'green' : 'white'}>
      {isSelected ? '" ' : '  '}
      {uniqueTask.title}
      {uniqueTask.isActive && <Text color="yellow"> [RUNNING]</Text>}
      {timeDisplay && <Text dimColor> ({timeDisplay})</Text>}
      {timeDisplay && (
        <Text dimColor>
          {' '}
          (
          {formatTime(
            uniqueTask.totalDuration +
              Math.floor(uniqueTask.totalDuration * 0.33),
          )}
          )
        </Text>
      )}
    </Text>
  );
};

export default NameAndDetails;
