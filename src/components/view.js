import React, {useEffect, useState} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {useData} from '../contexts/DataContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, VIEW} from '../consts.js';
import Frame from './Frame.js';
import HelpBottom from './HelpBottom.js';
import ScrollBox from './ScrollBox.js';
import projectService from '../services/projectService.js';
import taskService from '../services/taskService.js';
import clientService from '../services/clientService.js';
import timeEntryModel from '../models/timeEntry.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import useScrollableList from '../hooks/useScrollableList.js';
import useTaskAnalytics from '../hooks/useTaskAnalytics.js';
import usePricing from '../hooks/usePricing.js';
import TimeEditForm from './TimeEditForm.js';
import {
  formatTime,
  formatEstimation,
  sumEntryDurations,
  calculateDuration,
  formatRelativeTime,
  formatHour,
  formatCurrency,
  formatHourlyRate,
  getDateRange,
} from '../utils.js';
import {format} from 'date-fns';

const RANGE_OPTIONS = [
  {label: 'Today', type: 'today'},
  {label: 'Week', type: 'week'},
  {label: 'This Month', type: 'thisMonth'},
  {label: 'Prev Month', type: 'prevMonth'},
  {label: 'All', type: 'all'},
];

const View = () => {
  const {
    isViewFocused,
    isClientFocused,
    isProjectsFocused,
    isTasksFocused,
    getBorderTitle,
  } = useNavigation();
  const {
    selectedClientId,
    selectedProjectId,
    selectedTaskId,
    reload,
    triggerReload,
  } = useData();

  const [clients, setClients] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [taskDetails, setTaskDetails] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isEditingStart, setIsEditingStart] = useState(false);
  const [isEditingEnd, setIsEditingEnd] = useState(false);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

  const currentRange = getDateRange(RANGE_OPTIONS[selectedRangeIndex].type);

  const {
    selectedIndex: selectedEntryIndex,
    selectNext: selectNextEntry,
    selectPrevious: selectPreviousEntry,
  } = useScrollableList(timeEntries, {wrap: true});
  const {analytics, loading: analyticsLoading} = useTaskAnalytics(
    selectedTaskId,
    currentRange.startDate,
    currentRange.endDate,
  );
  const {pricing, loading: pricingLoading} = usePricing(
    selectedTaskId,
    null,
    null,
    currentRange.startDate,
    currentRange.endDate,
    reload,
  );

  useEffect(() => {
    const loadClients = async () => {
      const clientData = await clientService.selectAll();
      setClients(clientData);
    };
    loadClients();
  }, [reload]);

  useEffect(() => {
    if (isProjectsFocused) {
      const loadAllProjects = async () => {
        const projectData = await projectService.selectAll();
        setAllProjects(projectData);
      };
      loadAllProjects();
    }
  }, [isProjectsFocused, reload]);

  useEffect(() => {
    if (isTasksFocused) {
      const loadAllTasks = async () => {
        const [taskData, projectData] = await Promise.all([
          taskService.selectAll(),
          projectService.selectAll(),
        ]);
        setAllTasks(taskData);
        setAllProjects(projectData);
      };
      loadAllTasks();
    }
  }, [isTasksFocused, reload]);

  useEffect(() => {
    if (selectedTaskId && (isTasksFocused || isViewFocused)) {
      const loadTaskDetails = async () => {
        const [task, entries] = await Promise.all([
          taskService.selectById(selectedTaskId),
          timeEntryModel.selectByTaskIdWithDateRange(
            selectedTaskId,
            currentRange.startDate,
            currentRange.endDate,
          ),
        ]);
        setTaskDetails(task);
        setTimeEntries((entries || []).reverse());
      };
      loadTaskDetails();
    } else if (!selectedTaskId) {
      setTaskDetails(null);
      setTimeEntries([]);
    }
  }, [
    isTasksFocused,
    isViewFocused,
    selectedTaskId,
    reload,
    currentRange.startDate,
    currentRange.endDate,
  ]);

  const deleteSelectedEntry = async () => {
    if (timeEntries.length === 0) return;
    const entryToDelete = timeEntries[selectedEntryIndex];
    await timeEntryModel.delete(entryToDelete.id);
    setTimeEntries(prev => prev.filter(e => e.id !== entryToDelete.id));
    triggerReload();
  };

  const handleEditStart = () => {
    if (timeEntries.length === 0) return;
    setIsEditingStart(true);
  };

  const handleEditEnd = () => {
    if (timeEntries.length === 0) return;
    const entry = timeEntries[selectedEntryIndex];
    if (!entry.end) return;
    setIsEditingEnd(true);
  };

  const handleTimeSubmit = async newTime => {
    const entry = timeEntries[selectedEntryIndex];
    const updates = {id: entry.id};

    if (isEditingStart) updates.start = newTime;
    else if (isEditingEnd) updates.end = newTime;

    await timeEntryModel.update(updates);

    const updatedEntries = await timeEntryModel.selectByTaskIdWithDateRange(
      selectedTaskId,
      currentRange.startDate,
      currentRange.endDate,
    );
    setTimeEntries((updatedEntries || []).reverse());
    setIsEditingStart(false);
    setIsEditingEnd(false);
    triggerReload();
  };

  const handleTimeCancel = () => {
    setIsEditingStart(false);
    setIsEditingEnd(false);
  };

  const handleRangeNext = () => {
    setSelectedRangeIndex(prev =>
      prev < RANGE_OPTIONS.length - 1 ? prev + 1 : 0,
    );
  };

  const handleRangePrev = () => {
    setSelectedRangeIndex(prev =>
      prev > 0 ? prev - 1 : RANGE_OPTIONS.length - 1,
    );
  };

  const isEditing = isEditingStart || isEditingEnd;
  const keyMappings =
    selectedTaskId && taskDetails && !isEditing
      ? [
          {key: 'j', action: selectNextEntry},
          {key: 'k', action: selectPreviousEntry},
          {key: 'd', action: deleteSelectedEntry},
          {key: 'e', action: handleEditStart},
          {key: 'E', action: handleEditEnd},
          {key: 'h', action: handleRangePrev},
          {key: 'l', action: handleRangeNext},
        ]
      : [
          {key: 'h', action: handleRangePrev},
          {key: 'l', action: handleRangeNext},
        ];

  useComponentKeys(VIEW, keyMappings, isViewFocused);

  const borderColor = isViewFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(VIEW);

  const renderTaskDetails = () => {
    if (!taskDetails) return <Text dimColor>Loading task details...</Text>;

    if (isEditingStart && timeEntries.length > 0) {
      const entry = timeEntries[selectedEntryIndex];
      return (
        <TimeEditForm
          label="Edit Start Time"
          currentTime={entry.start}
          onSubmit={handleTimeSubmit}
          onCancel={handleTimeCancel}
        />
      );
    }

    if (isEditingEnd && timeEntries.length > 0) {
      const entry = timeEntries[selectedEntryIndex];
      return (
        <TimeEditForm
          label="Edit End Time"
          currentTime={entry.end}
          onSubmit={handleTimeSubmit}
          onCancel={handleTimeCancel}
        />
      );
    }

    const project = allProjects.find(p => p.id === taskDetails.project_id);
    const client = clients.find(c => c.id === project?.client_id);

    const totalSeconds = sumEntryDurations(timeEntries);

    const activeEntries = timeEntries.filter(e => !e.end).length;
    const estimatedSec = taskDetails.estimated_minutes
      ? taskDetails.estimated_minutes * 60
      : null;
    const isOvertime = estimatedSec && totalSeconds > estimatedSec;

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text dimColor>Range: </Text>
          {RANGE_OPTIONS.map((option, index) => (
            <Text key={option.label}>
              {index === selectedRangeIndex ? (
                <Text color="green" bold>
                  [{option.label}]
                </Text>
              ) : (
                <Text dimColor> {option.label} </Text>
              )}
            </Text>
          ))}
          <Text dimColor> (h/l to change)</Text>
        </Box>
        <Box flexDirection="row" marginBottom={1}>
          {/* Task Details Column */}
          <Box flexDirection="column" width={30}>
            <Text color="cyan" bold>
              Task Details:
            </Text>
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
                <Text color="green">Active</Text>
              ) : (
                <Text>Stopped</Text>
              )}
            </Text>
            <Text>
              <Text bold>Estimation: </Text>
              {formatEstimation(taskDetails.estimated_minutes) || (
                <Text dimColor>None</Text>
              )}
            </Text>
            <Text>
              <Text bold>Total: </Text>
              <Text color={isOvertime ? 'red' : undefined}>
                {formatTime(totalSeconds) || '-'}
              </Text>
            </Text>
          </Box>

          {/* Analytics Column */}
          <Box flexDirection="column" width={35} marginLeft={2}>
            {analyticsLoading ? (
              <Text dimColor>Loading...</Text>
            ) : analytics ? (
              <>
                <Text color="cyan" bold>
                  Analytics ({analytics.meta.dateRangeDays}d):
                </Text>
                <Text>
                  <Text bold>Sessions: </Text>
                  {analytics.distribution.sessionCount}
                </Text>
                <Text>
                  <Text bold>Days: </Text>
                  {analytics.distribution.daysWorked}/
                  {analytics.distribution.dateRangeDays}
                </Text>
                {analytics.distribution.peakHour !== null && (
                  <Text>
                    <Text bold>Peak: </Text>
                    {formatHour(analytics.distribution.peakHour)}
                  </Text>
                )}
                {analytics.distribution.deepWorkCount > 0 && (
                  <Text>
                    <Text bold>Deep Work: </Text>
                    <Text color="green">
                      {analytics.distribution.deepWorkCount}
                    </Text>
                  </Text>
                )}
                {analytics.distribution.lastActivityDate && (
                  <Text>
                    <Text bold>Last: </Text>
                    {formatRelativeTime(
                      analytics.distribution.lastActivityDate,
                    )}
                  </Text>
                )}
              </>
            ) : null}
          </Box>

          {/* Earnings Column */}
          <Box flexDirection="column" width={25} marginLeft={2}>
            {pricingLoading ? (
              <Text dimColor>Loading...</Text>
            ) : pricing && pricing.hourlyRate ? (
              <>
                <Text color="cyan" bold>
                  Earnings ({pricing.dateRangeDays}d):
                </Text>
                <Text>
                  <Text bold>Rate: </Text>
                  {formatHourlyRate(pricing.hourlyRate, pricing.currency)}
                </Text>
                <Text>
                  <Text bold>Hours: </Text>
                  {pricing.hours.toFixed(2)}h
                </Text>
                <Text>
                  <Text bold>Earned: </Text>
                  <Text color="green">
                    {formatCurrency(pricing.earnings, pricing.currency)}
                  </Text>
                </Text>
              </>
            ) : pricing && !pricing.hourlyRate ? (
              <>
                <Text color="cyan" bold>
                  Earnings:
                </Text>
                <Text dimColor>No rate set</Text>
              </>
            ) : null}
          </Box>
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

            <ScrollBox height={15} selectedIndex={selectedEntryIndex}>
              {timeEntries.map((entry, index) => {
                const isSelected =
                  index === selectedEntryIndex && isViewFocused;
                const duration = entry.end
                  ? calculateDuration(entry.start, entry.end)
                  : 0;

                return (
                  <Box key={entry.id}>
                    <Text color={isSelected ? 'green' : 'white'} width={4}>
                      {isSelected ? '• ' : '  '}
                    </Text>
                    <Text color={isSelected ? 'green' : 'white'} width={22}>
                      {format(entry.start, 'yyyy-MM-dd HH:mm:ss')}
                    </Text>
                    <Box paddingX={1}>
                      <Text color={isSelected ? 'green' : 'white'} width={22}>
                        {entry.end ? (
                          format(entry.end, 'yyyy-MM-dd HH:mm:ss')
                        ) : (
                          <Text color="yellow">Running...</Text>
                        )}
                      </Text>
                    </Box>
                    <Text color={isSelected ? 'green' : 'white'}>
                      {duration > 0 ? formatTime(duration) : '-'}
                    </Text>
                  </Box>
                );
              })}
            </ScrollBox>
          </Box>
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
      if (allProjects.length === 0)
        return <Text dimColor>No projects found</Text>;

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

    if (isViewFocused && selectedTaskId) return renderTaskDetails();

    return <Text dimColor>Select an item to view details</Text>;
  };

  const hasTimeEntries = timeEntries.length > 0;

  return (
    <Frame borderColor={borderColor} width={'100%'} height={45}>
      <Frame.Header>
        <Text color={borderColor} bold>
          {title}
          {taskDetails && <Text dimColor> - {taskDetails.title}</Text>}
        </Text>
      </Frame.Header>
      <Frame.Body>{renderContent()}</Frame.Body>
      <Frame.Footer>
        {isViewFocused && selectedTaskId && hasTimeEntries && (
          <HelpBottom>h/l:range j/k:entries e/E:edit d:delete</HelpBottom>
        )}
      </Frame.Footer>
    </Frame>
  );
};

export default View;
