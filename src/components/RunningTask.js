import React, {useEffect, useState} from 'react';
import {Text} from 'ink';
import {useData} from '../contexts/DataContext.js';
import useTimer from '../hooks/useTimer.js';
import taskService from '../services/taskService.js';

const pad = n => String(n).padStart(2, '0');

const formatPadded = seconds => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${pad(minutes)}m ${pad(secs)}s`;
  return `${pad(minutes)}m ${pad(secs)}s`;
};

const RunningTask = ({timeSoFar = 0}) => {
  const {reload, selectedProjectId} = useData();
  const {currentValue, start, stop, initialValue} = useTimer();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchAndStart = async () => {
      const activeTask = await taskService.getActiveTask();
      if (activeTask) {
        const elapsedSeconds = Math.floor(
          (Date.now() - activeTask.start.getTime()) / 1000,
        );
        initialValue(elapsedSeconds);
        setIsActive(true);
        start();
      } else {
        setIsActive(false);
        stop();
      }
    };
    fetchAndStart();

    return () => stop();
  }, [reload, selectedProjectId]);

  if (!isActive) return null;

  const total = timeSoFar + currentValue;

  return (
    <Text>
      {formatPadded(total)} ← {formatPadded(currentValue)}
    </Text>
  );
};

export default RunningTask;
