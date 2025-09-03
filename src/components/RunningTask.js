import React, {useEffect, useState} from 'react';

import {Text} from 'ink';

import {useNavigation} from '../contexts/NavigationContext.js';
import {formatTime} from '../utils.js';
import useTimer from '../hooks/useTimer.js';
import taskService from '../services/taskService.js';

const RunningTask = () => {
  const {reload, selectedProjectId} = useNavigation();
  const {currentValue, start, stop, initialValue} = useTimer();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchAndStart = async () => {
      const activeTask = await taskService.getActiveTask();
      if (activeTask) {
        const elapsedSeconds = Math.floor(
          (Date.now() - new Date(activeTask.start).getTime()) / 1000,
        );
        initialValue(elapsedSeconds);
        setIsActive(activeTask);
        start();
      } else {
        setIsActive(false);
        stop();
      }
    };
    fetchAndStart();

    () => {
      stop();
    };
  }, [reload, selectedProjectId]);

  if (!isActive) {
    return <Text color="gray">No task currently running</Text>;
  }
  return (
    <Text>
      <Text color="yellow">[RUNNING] </Text>
      <Text color="white">{isActive.title}</Text>
      <Text color="cyan"> ({formatTime(currentValue)})</Text>
    </Text>
  );
};

export default RunningTask;
