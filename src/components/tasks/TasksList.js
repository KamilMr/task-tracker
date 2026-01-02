import React from 'react';
import {Text, Box} from 'ink';
import NameAndDetails from './NameAndDetails.js';
import {formatTime} from '../../utils.js';

const TasksList = ({
  selectedProject,
  dateDisplay,
  dateTasks,
  selectedTaskId,
  isT1,
}) => {
  return (
    <Box flexDirection="column">
      {dateTasks.map(uniqueTask => (
        <NameAndDetails
          key={uniqueTask.id}
          uniqueTask={uniqueTask}
          isSelected={uniqueTask.id === selectedTaskId}
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
