import React, {useState, useEffect} from 'react';

import {Text, Box} from 'ink';

import DelayedDisappear from './DelayedDisappear.js';
import Frame from './Frame.js';
import HelpBottom from './HelpBottom.js';
import RunningTask from './RunningTask.js';
import TasksContent from './tasks/TasksContent.js';
import TodayHours from './TodayHours.js';
import taskService from '../services/taskService.js';
import useDateTasks from '../hooks/useDateTasks.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, TASKS} from '../consts.js';
import {getDayOfWeek, retriveYYYYMMDD} from '../utils.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {useNavigation} from '../contexts/NavigationContext.js';
import createTogglSync from '../toggl-sync/index.js';
import syncedDay from '../models/syncedDay.js';

const Tasks = () => {
  const {
    isTasksFocused,
    getBorderTitle,
    mode,
    selectedProjectId,
    getSelectedProject,
    setReload,
    reload,
  } = useNavigation();

  const [message, setMessage] = useState('');
  const [isT1, setIsT1] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTaskName, setSelectedTaskName] = useState(null);
  const [selectedDate, setSelectedDate] = useState(retriveYYYYMMDD());
  const [isSynced, setIsSynced] = useState(false);

  const dateTasks = useDateTasks(selectedDate);

  // fire when project changes and updates selection to first element
  useEffect(() => {
    setSelectedTaskName(dateTasks[0]?.title);
  }, [selectedProjectId]);

  // Check sync status when date changes
  useEffect(() => {
    const checkSyncStatus = async () => {
      const synced = await syncedDay.isSynced(selectedDate);
      setIsSynced(synced);
    };
    checkSyncStatus();
  }, [selectedDate]);

  const borderColor = isTasksFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const baseTitle = getBorderTitle(TASKS);
  const dateDisplay =
    (selectedDate === retriveYYYYMMDD() ? 'today' : selectedDate) + ' - ' +getDayOfWeek(new Date(selectedDate));

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

  const handleSetIsT1 = () => setIsT1(!isT1);

  const handleTogglSync = async () => {
    if (isSynced) {
      setMessage('Day already synced');
      return;
    }

    try {
      setMessage('Syncing with Toggl...');

      const togglSync = createTogglSync(
        process.env.TOGGL_API_TOKEN,
        process.env.TOGGL_WORKSPACE_ID
      );

      const dateToSync = new Date(selectedDate);
      const results = await togglSync.syncTasksByDate(dateToSync);

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (failed === 0) {
        await syncedDay.markAsSynced(selectedDate);
        setIsSynced(true);
        setMessage(`Synced ${successful} tasks successfully`);
        setReload();
      } else {
        setMessage(`Synced ${successful} tasks, ${failed} failed`);
      }
    } catch (error) {
      setMessage(`Sync error: ${error.message}`);
    }
  };

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
      action: handleSetIsT1,
    },
    {
      key: 't',
      action: handleTogglSync,
    },
  ];

  useComponentKeys(TASKS, keyMappings, isTasksFocused);

  const selectedProject = getSelectedProject();

  return (
    <Frame borderColor={borderColor} height={20}>
      <Frame.Header>
        <Text color={borderColor} bold>
          {baseTitle}  - <TodayHours selectedDate={selectedDate} isT1={isT1} /> -{' '}
          {dateDisplay}
        </Text>
        <DelayedDisappear key={message}>
          <Text color="yellow">{message}</Text>
        </DelayedDisappear>
      </Frame.Header>
      <Frame.Body>
        <RunningTask />
        <TasksContent
          isCreating={isCreating}
          isEditing={isEditing}
          dateTasks={dateTasks}
          selectedProject={selectedProject}
          selectedTaskName={selectedTaskName}
          dateDisplay={dateDisplay}
          isT1={isT1}
          handleCreateSubmit={handleCreateSubmit}
          handleCreateCancel={handleCreateCancel}
          handleEditSubmit={handleEditSubmit}
          handleEditCancel={handleEditCancel}
        />
      </Frame.Body>
      <Frame.Footer>
        {isTasksFocused && mode === 'normal' && !isCreating && !isEditing && (
          <HelpBottom>
            j/k:navigate c:new e:edit d:delete s:start/stop p/n:prev/next day t:{isSynced ? 'synced' : 'sync'}
          </HelpBottom>
        )}
      </Frame.Footer>
    </Frame>
  );
};

export default Tasks;
