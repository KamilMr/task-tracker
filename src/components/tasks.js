import React, {useState} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, TASKS} from '../consts.js';
import BasicTextInput from './BasicTextInput.js';
import taskService from '../services/taskService.js';

const Tasks = () => {
  const {
    isTasksFocused,
    getBorderTitle,
    mode,
    tasks,
    selectedTaskId,
    getSelectedTask,
    selectNextTask,
    selectPreviousTask,
    selectedProjectId,
    getSelectedProject,
    reloadTasks,
  } = useNavigation();
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const borderColor = isTasksFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(TASKS);

  const handleNewTask = () => {
    if (!selectedProjectId) {
      setMessage('Select a project first');
      return;
    }
    setIsCreating(true);
    setMessage('');
  };

  const handleEditTask = () => {
    if (!selectedTaskId) {
      setMessage('No task selected');
      return;
    }
    setIsEditing(true);
    setMessage('');
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId) {
      setMessage('No task selected');
      return;
    }
    try {
      const task = getSelectedTask();
      await taskService.delete(selectedTaskId);
      await reloadTasks();
      setMessage(`Deleted task: ${task.title}`);
    } catch (error) {
      setMessage(`Error deleting task: ${error.message}`);
    }
  };

  const handleCreateSubmit = async (title) => {
    if (!title.trim()) return;
    try {
      await taskService.create({
        title: title.trim(),
        projectId: selectedProjectId,
        start: null,
        end: null,
      });
      await reloadTasks();
      setIsCreating(false);
      setMessage(`Created task: ${title}`);
    } catch (error) {
      setMessage(`Error creating task: ${error.message}`);
    }
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    setMessage('');
  };

  const handleEditSubmit = async (title) => {
    if (!title.trim()) return;
    try {
      const task = getSelectedTask();
      await taskService.update({
        id: selectedTaskId,
        title: title.trim(),
        projectId: task.project_id,
        start: task.start,
        end: task.end,
      });
      await reloadTasks();
      setIsEditing(false);
      setMessage(`Updated task: ${title}`);
    } catch (error) {
      setMessage(`Error updating task: ${error.message}`);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setMessage('');
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
      key: 'j',
      action: selectNextTask,
    },
    {
      key: 'k',
      action: selectPreviousTask,
    },
  ];

  useComponentKeys(TASKS, keyMappings, isTasksFocused);

  const selectedProject = getSelectedProject();
  const selectedTask = getSelectedTask();

  const renderContent = () => {
    if (isCreating) {
      return (
        <Box flexDirection="column">
          <Text>New task title:</Text>
          <BasicTextInput onSubmit={handleCreateSubmit} onCancel={handleCreateCancel} />
        </Box>
      );
    }

    if (isEditing) {
      return (
        <Box flexDirection="column">
          <Text>Edit task title:</Text>
          <BasicTextInput
            defaultValue={selectedTask?.title || ''}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
          />
        </Box>
      );
    }

    if (!selectedProject) {
      return <Text dimColor>Select a project to view tasks</Text>;
    }

    if (tasks.length === 0) {
      return (
        <Box flexDirection="column">
          <Text dimColor>No tasks for {selectedProject.name}</Text>
          <Text dimColor>Press 'n' to create a new task</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Text color="cyan" bold>
          {selectedProject.name} Tasks:
        </Text>
        {tasks.map(task => (
          <Text
            key={task.id}
            color={task.id === selectedTaskId ? 'green' : 'white'}
          >
            {task.id === selectedTaskId ? '• ' : '  '}
            {task.title}
          </Text>
        ))}
      </Box>
    );
  };

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
      {message && <Text color="yellow">{message}</Text>}
      {renderContent()}
      {isTasksFocused && mode === 'normal' && !isCreating && !isEditing && (
        <Text dimColor>j/k:navigate n:new e:edit d:delete</Text>
      )}
    </Box>
  );
};

export default Tasks;
