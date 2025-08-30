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
  isT1,
}) => {
  return (
    <Box flexDirection="column">
      <RunningTask />
      {dateTasks.map(uniqueTask => (
        <NameAndDetails
          key={uniqueTask.title}
          uniqueTask={uniqueTask}
          isSelected={uniqueTask.title === selectedTaskName}
          timeDisplay={formatTime(
            isT1
              ? Math.floor(uniqueTask.totalSec + uniqueTask.totalSec * 0.33)
              : uniqueTask.totalSec,
          )}
        />
      ))}
    </Box>
  );
};

export default TasksList;
