import React from 'react';
import {Text} from 'ink';

const NameAndDetails = ({uniqueTask, isSelected, timeDisplay}) => {
  return (
    <Text key={uniqueTask.title} color={isSelected ? 'green' : 'white'}>
      {isSelected ? '" ' : '  '}
      {uniqueTask.title}
      {timeDisplay && <Text dimColor> ({timeDisplay})</Text>}
    </Text>
  );
};

export default NameAndDetails;
