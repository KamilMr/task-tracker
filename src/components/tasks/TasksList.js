import React from 'react';
import {Text, Box} from 'ink';
import NameAndDetails from './NameAndDetails.js';
import RunningTask from '../RunningTask.js';
import {formatTime} from '../../utils.js';

const TasksList = ({
  selectedProject,
  dateDisplay,
  dateTasks,
  selectedTaskName,
  isDiff,
}) => {
  return (
    <Box flexDirection="column">
      <RunningTask />
      <Text color="cyan" bold>
        {selectedProject.name} Tasks ({dateDisplay}):
      </Text>
      {dateTasks.map(uniqueTask => (
        <NameAndDetails
          key={uniqueTask.title}
          uniqueTask={uniqueTask}
          isSelected={uniqueTask.title === selectedTaskName}
          timeDisplay={formatTime(
            isDiff
              ? Math.floor(uniqueTask.totalSec + uniqueTask.totalSec * 0.33)
              : uniqueTask.totalSec,
          )}
        />
      ))}
    </Box>
  );
};

export default TasksList;
