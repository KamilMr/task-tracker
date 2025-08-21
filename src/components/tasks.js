import React, {useState} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, TASKS} from '../consts.js';

const Tasks = () => {
  const {isTasksFocused, getBorderTitle, mode} = useNavigation();
  const [message, setMessage] = useState('Tasks content here');
  const [timerRunning, setTimerRunning] = useState(false);
  
  const borderColor = isTasksFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(TASKS);

  const handleNewTask = () => {
    setMessage('New task action triggered');
  };

  const handleEditTask = () => {
    setMessage('Edit task action triggered');
  };

  const handleDeleteTask = () => {
    setMessage('Delete task action triggered');
  };

  const handleStartStopTimer = () => {
    setTimerRunning(!timerRunning);
    setMessage(timerRunning ? 'Timer stopped' : 'Timer started');
  };

  // Task key mappings (normal mode only)
  const keyMappings = [
    {
      key: 'n',
      action: handleNewTask,
    },
    {
      key: 'e',
      action: handleEditTask,
    },
    {
      key: 'd',
      action: handleDeleteTask,
    },
    {
      key: 's',
      action: handleStartStopTimer,
    },
  ];

  useComponentKeys(TASKS, keyMappings, isTasksFocused);

  return (
    <Box
      borderColor={borderColor}
      borderStyle={'round'}
      height={20}
      flexDirection="column"
    >
      <Text color={borderColor} bold>
        {title}
      </Text>
      <Text>{message}</Text>
      {isTasksFocused && mode === 'normal' && (
        <Text dimColor>n:new e:edit d:delete s:timer</Text>
      )}
    </Box>
  );
};

export default Tasks;
