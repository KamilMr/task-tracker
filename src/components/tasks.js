import React, {useState, useEffect} from 'react';

import {Text, Box} from 'ink';

import DelayedDisappear from './DelayedDisappear.js';
import TasksContent from './tasks/TasksContent.js';
import TodayHours from './TodayHours.js';
import taskService from '../services/taskService.js';
import useDateTasks from '../hooks/useDateTasks.js';
import {retriveYYYYMMDD} from '../utils.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {useNavigation} from '../contexts/NavigationContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, TASKS} from '../consts.js';

const Tasks = () => {
  const {
    isTasksFocused,
    getBorderTitle,
    mode,
    selectedProjectId,
    getSelectedProject,
    setReload,
  } = useNavigation();
  const [message, setMessage] = useState('');
  const [isDiff, setIsDiff] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTaskName, setSelectedTaskName] = useState(null);
  const [selectedDate, setSelectedDate] = useState(retriveYYYYMMDD());

  const dateTasks = useDateTasks(selectedDate);

  // fire when project changes and updates selection to first element
  useEffect(() => {
    setSelectedTaskName(dateTasks[0]?.title);
  }, [selectedProjectId]);

  const borderColor = isTasksFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const baseTitle = getBorderTitle(TASKS);
  const dateDisplay = selectedDate === retriveYYYYMMDD() ? 'today' : selectedDate;

  // Navigation functions for unique task names
  const selectNextUniqueTask = () => {
    if (dateTasks.length === 0) return;

    const currentIndex = dateTasks.findIndex(
      task => task.title === selectedTaskName,
    );
    const nextIndex =
      currentIndex < dateTasks.length - 1 ? currentIndex + 1 : 0;
    setSelectedTaskName(dateTasks[nextIndex].title);
  };

  const selectPreviousUniqueTask = () => {
    if (dateTasks.length === 0) return;

    const currentIndex = dateTasks.findIndex(
      task => task.title === selectedTaskName,
    );
    const prevIndex =
      currentIndex > 0 ? currentIndex - 1 : dateTasks.length - 1;
    setSelectedTaskName(dateTasks[prevIndex].title);
  };

  const handleNewTask = () => {
    if (!selectedProjectId) {
      setMessage('Select a project first');
      return;
    }
    setIsCreating(true);
    setMessage('');
  };

  const handleEditTask = () => {
    if (!selectedTaskName) {
      setMessage('No task selected');
      return;
    }
    setIsEditing(true);
    setMessage('');
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskName) {
      setMessage('No task selected');
      return;
    }
    try {
      await taskService.deleteAllByTitle(selectedTaskName, selectedProjectId);
      setReload();
      setMessage(`Deleted all entries for task: ${selectedTaskName}`);
    } catch (error) {
      setMessage(`Error deleting task: ${error.message}`);
    }
  };

  const handleCreateSubmit = async title => {
    if (!title.trim()) return;
    try {
      taskService.toggleTask({
        title: title.trim(),
        projectId: selectedProjectId,
      });

      setIsCreating(false);
      setMessage(`Created task: ${title}`);
      setReload();
    } catch (error) {
      setMessage(`Error creating task: ${error.message}`);
    }
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    setMessage('');
  };

  const handleEditSubmit = async title => {
    if (!title.trim()) return;
    try {
      // Update all entries for this task name
      await taskService.update(
        selectedTaskName,
        title.trim(),
        selectedProjectId,
      );

      setIsEditing(false);
      setSelectedTaskName(title.trim()); // Update selected name to new name
      setMessage(`Updated task: ${title}`);
      setReload();
    } catch (error) {
      setMessage(`Error updating task: ${error.message}`);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setMessage('');
  };

  const handleStartStopTask = async () => {
    if (!selectedTaskName) {
      setMessage('No task selected');
      return;
    }

    try {
      await taskService.toggleTask({
        title: selectedTaskName,
        projectId: selectedProjectId,
      });
      setReload();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(retriveYYYYMMDD(currentDate));
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(retriveYYYYMMDD(currentDate));
  };

  const handleSetIsDiff = () => setIsDiff(!isDiff);

  // Task key mappings (normal mode only)
  const keyMappings = [
    {
      key: 'c',
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
      key: 'j',
      action: selectNextUniqueTask,
    },
    {
      key: 'k',
      action: selectPreviousUniqueTask,
    },
    {
      key: 's',
      action: handleStartStopTask,
    },
    {
      key: 'p',
      action: handlePreviousDay,
    },
    {
      key: 'n',
      action: handleNextDay,
    },
    {
      key: 'x',
      action: handleSetIsDiff,
    },
  ];

  useComponentKeys(TASKS, keyMappings, isTasksFocused);

  const selectedProject = getSelectedProject();

  return (
    <Box
      borderColor={borderColor}
      borderStyle={'round'}
      minHeight={20}
      // height={'40%'}
      flexDirection="column"
    >
      <Text color={borderColor} bold>
        {baseTitle} <TodayHours selectedDate={selectedDate} /> - {dateDisplay}
      </Text>
      <DelayedDisappear key={message}>
        <Text color="yellow">{message}</Text>
      </DelayedDisappear>
      <TasksContent
        isCreating={isCreating}
        isEditing={isEditing}
        dateTasks={dateTasks}
        selectedProject={selectedProject}
        selectedTaskName={selectedTaskName}
        dateDisplay={dateDisplay}
        isDiff={isDiff}
        handleCreateSubmit={handleCreateSubmit}
        handleCreateCancel={handleCreateCancel}
        handleEditSubmit={handleEditSubmit}
        handleEditCancel={handleEditCancel}
      />
      {isTasksFocused && mode === 'normal' && !isCreating && !isEditing && (
        <Text dimColor>
          j/k:navigate c:new e:edit d:delete s:start/stop p/n:prev/next day
        </Text>
      )}
    </Box>
  );
};

export default Tasks;
