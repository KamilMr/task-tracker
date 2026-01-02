import React, {useEffect, useState} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, VIEW} from '../consts.js';
import Frame from './Frame.js';
import projectService from '../services/projectService.js';
import taskService from '../services/taskService.js';
import timeEntryModel from '../models/timeEntry.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {formatTime, formatEstimation} from '../utils.js';

const View = () => {
  const {
    isViewFocused,
    isClientFocused,
    isProjectsFocused,
    isTasksFocused,
    getBorderTitle,
    clients,
    selectedClientId,
    selectedProjectId,
    selectedTaskId,
  } = useNavigation();
  const [allProjects, setAllProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [taskDetails, setTaskDetails] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(0);

  // Load all projects when projects section is focused
  useEffect(() => {
    if (isProjectsFocused) {
      const loadAllProjects = async () => {
        try {
          const projectData = await projectService.selectAll();
          setAllProjects(projectData);
        } catch (error) {
          console.error('Failed to load all projects:', error);
        }
      };
      loadAllProjects();
    }
  }, [isProjectsFocused]);

  // Load all tasks when tasks section is focused
  useEffect(() => {
    if (isTasksFocused) {
      const loadAllTasks = async () => {
        try {
          const [taskData, projectData] = await Promise.all([
            taskService.selectAll(),
            projectService.selectAll(),
          ]);
          setAllTasks(taskData);
          setAllProjects(projectData);
        } catch (error) {
          console.error('Failed to load all tasks:', error);
        }
      };
      loadAllTasks();
    }
  }, [isTasksFocused]);

  // Load task details and time entries when task is selected
  useEffect(() => {
    if (isTasksFocused && selectedTaskId) {
      const loadTaskDetails = async () => {
        try {
          const [task, entries] = await Promise.all([
            taskService.selectById(selectedTaskId),
            timeEntryModel.selectByTaskId(selectedTaskId),
          ]);
          setTaskDetails(task);
          setTimeEntries(entries || []);
          setSelectedEntryIndex(0);
        } catch (error) {
          console.error('Failed to load task details:', error);
          setTaskDetails(null);
          setTimeEntries([]);
        }
      };
      loadTaskDetails();
    } else {
      setTaskDetails(null);
      setTimeEntries([]);
    }
  }, [isTasksFocused, selectedTaskId]);

  // Navigation handlers for entries table
  const selectNextEntry = () => {
    if (timeEntries.length === 0) return;
    setSelectedEntryIndex(prev =>
      prev < timeEntries.length - 1 ? prev + 1 : 0,
    );
  };

  const selectPreviousEntry = () => {
    if (timeEntries.length === 0) return;
    setSelectedEntryIndex(prev =>
      prev > 0 ? prev - 1 : timeEntries.length - 1,
    );
  };

  const deleteSelectedEntry = async () => {
    if (timeEntries.length === 0) return;
    const entryToDelete = timeEntries[selectedEntryIndex];

    try {
      await timeEntryModel.delete(entryToDelete.id);
      const updatedEntries = timeEntries.filter(e => e.id !== entryToDelete.id);
      setTimeEntries(updatedEntries);
      if (selectedEntryIndex >= updatedEntries.length)
        setSelectedEntryIndex(Math.max(0, updatedEntries.length - 1));
    } catch (error) {
      console.error('Failed to delete time entry:', error);
    }
  };

  // Register key handlers when view is focused and task is selected
  const keyMappings =
    isTasksFocused && selectedTaskId && taskDetails
      ? [
          {key: 'j', action: selectNextEntry},
          {key: 'k', action: selectPreviousEntry},
          {key: 'd', action: deleteSelectedEntry},
        ]
      : [];

  useComponentKeys(VIEW, keyMappings, isViewFocused);

  const borderColor = isViewFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(VIEW);

  const renderTaskDetails = () => {
    if (!taskDetails) return <Text dimColor>Loading task details...</Text>;

    const project = allProjects.find(p => p.id === taskDetails.project_id);
    const client = clients.find(c => c.id === project?.client_id);

    // Calculate total time from entries
    let totalSeconds = 0;
    timeEntries.forEach(entry => {
      if (entry.start && entry.end) {
        const startTime = new Date(entry.start).getTime();
        const endTime = new Date(entry.end).getTime();
        totalSeconds += Math.floor((endTime - startTime) / 1000);
      }
    });

    const activeEntries = timeEntries.filter(e => !e.end).length;
    const estimatedSec = taskDetails.estimated_minutes
      ? taskDetails.estimated_minutes * 60
      : null;
    const isOvertime = estimatedSec && totalSeconds > estimatedSec;

    return (
      <Box flexDirection="column">
        <Text color="cyan" bold>
          Task Details:
        </Text>
        <Box flexDirection="column" marginTop={1} marginBottom={1}>
          <Text>
            <Text bold>Title: </Text>
            {taskDetails.title}
          </Text>
          <Text>
            <Text bold>Project: </Text>
            {project?.name || 'Unknown'}
          </Text>
          <Text>
            <Text bold>Client: </Text>
            {client?.name || 'Unknown'}
          </Text>
          <Text>
            <Text bold>Status: </Text>
            {activeEntries > 0 ? (
              <Text color="green">Active ({activeEntries} running)</Text>
            ) : (
              <Text>Stopped</Text>
            )}
          </Text>
          <Text>
            <Text bold>Estimation: </Text>
            {formatEstimation(taskDetails.estimated_minutes) || (
              <Text dimColor>No estimation</Text>
            )}
          </Text>
          <Text>
            <Text bold>Total Time: </Text>
            <Text color={isOvertime ? 'red' : undefined}>
              {formatTime(totalSeconds) || (
                <Text dimColor>No time tracked</Text>
              )}
              {isOvertime && ' (overtime)'}
            </Text>
          </Text>
          <Text>
            <Text bold>Created: </Text>
            {new Date(taskDetails.created_at).toLocaleString()}
          </Text>
        </Box>

        <Text color="cyan" bold>
          Time Entries ({timeEntries.length}):
        </Text>
        {timeEntries.length === 0 ? (
          <Text dimColor marginLeft={2}>
            No time entries for this task
          </Text>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            <Box>
              <Text bold dimColor width={4}>
                {'  '}
              </Text>
              <Text bold dimColor width={22}>
                Start
              </Text>
              <Text bold dimColor width={22}>
                End
              </Text>
              <Text bold dimColor>
                Duration
              </Text>
            </Box>

            {timeEntries.map((entry, index) => {
              const isSelected = index === selectedEntryIndex && isViewFocused;
              const startDate = new Date(entry.start);
              const endDate = entry.end ? new Date(entry.end) : null;
              const duration = endDate
                ? Math.floor((endDate - startDate) / 1000)
                : 0;

              return (
                <Box key={entry.id}>
                  <Text color={isSelected ? 'green' : 'white'} width={4}>
                    {isSelected ? '• ' : '  '}
                  </Text>
                  <Text color={isSelected ? 'green' : 'white'} width={22}>
                    {startDate.toLocaleString()}
                  </Text>
                  <Text color={isSelected ? 'green' : 'white'} width={22}>
                    {endDate ? (
                      endDate.toLocaleString()
                    ) : (
                      <Text color="yellow">Running...</Text>
                    )}
                  </Text>
                  <Text color={isSelected ? 'green' : 'white'}>
                    {duration > 0 ? formatTime(duration) : '-'}
                  </Text>
                </Box>
              );
            })}
          </Box>
        )}

        {isViewFocused && timeEntries.length > 0 && (
          <Text dimColor marginTop={1}>
            j/k:navigate d:delete
          </Text>
        )}
      </Box>
    );
  };

  const renderContent = () => {
    if (isClientFocused && clients.length > 0) {
      return (
        <Box flexDirection="column">
          <Text color="cyan" bold>
            All Clients:
          </Text>
          {clients.map(client => (
            <Text
              key={client.id}
              color={client.id === selectedClientId ? 'green' : 'white'}
            >
              {client.id === selectedClientId ? '• ' : '  '}
              {client.name}
            </Text>
          ))}
        </Box>
      );
    }

    if (isProjectsFocused) {
      if (allProjects.length === 0) {
        return <Text dimColor>No projects found</Text>;
      }

      return (
        <Box flexDirection="column">
          <Text color="cyan" bold>
            All Projects:
          </Text>
          {allProjects.map(project => {
            const client = clients.find(c => c.id === project.client_id);
            return (
              <Text
                key={project.id}
                color={project.id === selectedProjectId ? 'green' : 'white'}
              >
                {project.id === selectedProjectId ? '• ' : '  '}
                {project.name}
                {client && <Text dimColor> ({client.name})</Text>}
              </Text>
            );
          })}
        </Box>
      );
    }

    if (isTasksFocused) {
      // Show task details when a task is selected
      if (selectedTaskId) return renderTaskDetails();

      if (allTasks.length === 0) return <Text dimColor>No tasks found</Text>;

      return (
        <Box flexDirection="column">
          <Text color="cyan" bold>
            All Tasks:
          </Text>
          {allTasks.slice(0, 10).map(task => {
            const project = allProjects.find(p => p.id === task.project_id);
            const client = clients.find(c => c.id === project?.client_id);
            return (
              <Text
                key={task.id}
                color={task.id === selectedTaskId ? 'green' : 'white'}
              >
                {task.id === selectedTaskId ? '• ' : '  '}
                {task.title}
                {project && <Text dimColor> ({project.name}</Text>}
                {client && <Text dimColor> - {client.name})</Text>}
              </Text>
            );
          })}
        </Box>
      );
    }

    return <Text>View content here</Text>;
  };

  return (
    <Frame borderColor={borderColor} width={'100%'} height={45}>
      <Frame.Header>
        <Text color={borderColor} bold>
          {title}
        </Text>
      </Frame.Header>
      <Frame.Body>{renderContent()}</Frame.Body>
    </Frame>
  );
};

export default View;
