import React from 'react';
import {Box} from 'ink';
import NameAndDetails from './NameAndDetails.js';
import ScrollBox from '../ScrollBox.js';
import {formatTime} from '../../utils.js';

const VISIBLE_TASKS = 10;

const TasksList = ({dateTasks, selectedTaskId, isT1}) => {
  const selectedIndex = dateTasks.findIndex(t => t.id === selectedTaskId);

  return (
    <ScrollBox
      height={VISIBLE_TASKS}
      selectedIndex={selectedIndex}
      itemCount={dateTasks.length}
    >
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
    </ScrollBox>
  );
};

export default TasksList;
