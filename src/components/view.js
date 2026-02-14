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
import KeyValue from './KeyValue.js';
import RangeSelector from './RangeSelector.js';
import Earnings from './Earnings.js';
import SelectableList from './SelectableList.js';
import {
  formatTime,
  formatEstimation,
  sumEntryDurations,
  calculateDuration,
  formatRelativeTime,
  formatHour,
  getDateRange,
} from '../utils.js';
import {format} from 'date-fns';

const RANGE_OPTIONS = [
  {label: 'Dashboard', type: 'dashboard'},
  {label: 'Today', type: 'today'},
  {label: 'Week', type: 'week'},
  {label: 'This Month', type: 'thisMonth'},
  {label: 'Prev Month', type: 'prevMonth'},
  {label: 'All', type: 'all'},
];

const View = ({height}) => {
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
  const [lastSection, setLastSection] = useState(null);
  const [dashboardTasks, setDashboardTasks] = useState([]);

  useEffect(() => {
    if (isClientFocused) setLastSection('client');
    else if (isProjectsFocused) setLastSection('project');
    else if (isTasksFocused) setLastSection('task');
  }, [isClientFocused, isProjectsFocused, isTasksFocused]);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(1);
  const [projectRangeIndex, setProjectRangeIndex] = useState(1);
  const [clientRangeIndex, setClientRangeIndex] = useState(1);

  const currentRange = getDateRange(RANGE_OPTIONS[selectedRangeIndex].type);
  const projectRange = getDateRange(RANGE_OPTIONS[projectRangeIndex].type);
  const clientRange = getDateRange(RANGE_OPTIONS[clientRangeIndex].type);

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
  const {pricing: projectPricing, loading: projectPricingLoading} = usePricing(
    null,
    selectedProjectId,
    null,
    projectRange.startDate,
    projectRange.endDate,
    reload,
  );
  const {pricing: clientPricing, loading: clientPricingLoading} = usePricing(
    null,
    null,
    selectedClientId,
    clientRange.startDate,
    clientRange.endDate,
    reload,
  );

  useEffect(() => {
    const loadInitialData = async () => {
      const [clientData, projectData] = await Promise.all([
        clientService.selectAll(),
        projectService.selectAll(),
      ]);
      setClients(clientData);
      setAllProjects(projectData);
    };
    loadInitialData();
  }, [reload]);

  useEffect(() => {
    if (isTasksFocused) {
      taskService.selectAll().then(setAllTasks);
    }
  }, [isTasksFocused, reload]);

  useEffect(() => {
    taskService.getAllTasksFromToday(new Date(), null).then(setDashboardTasks);
  }, [reload]);

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

  const makeRangeHandlers = setter => ({
    next: () => setter(prev => (prev < RANGE_OPTIONS.length - 1 ? prev + 1 : 0)),
    prev: () => setter(prev => (prev > 0 ? prev - 1 : RANGE_OPTIONS.length - 1)),
  });

  const projectRangeHandlers = makeRangeHandlers(setProjectRangeIndex);
  const clientRangeHandlers = makeRangeHandlers(setClientRangeIndex);

  const isEditing = isEditingStart || isEditingEnd;
  const activeSection = isViewFocused ? lastSection : (
    isClientFocused ? 'client' : isProjectsFocused ? 'project' : 'task'
  );

  let keyMappings;
  if (activeSection === 'task' && selectedTaskId && taskDetails && !isEditing)
    keyMappings = [
      {key: 'j', action: selectNextEntry},
      {key: 'k', action: selectPreviousEntry},
      {key: 'd', action: deleteSelectedEntry},
      {key: 'e', action: handleEditStart},
      {key: 'E', action: handleEditEnd},
      {key: 'h', action: handleRangePrev},
      {key: 'l', action: handleRangeNext},
    ];
  else if (activeSection === 'project' && selectedProjectId)
    keyMappings = [
      {key: 'h', action: projectRangeHandlers.prev},
      {key: 'l', action: projectRangeHandlers.next},
    ];
  else if (activeSection === 'client' && selectedClientId)
    keyMappings = [
      {key: 'h', action: clientRangeHandlers.prev},
      {key: 'l', action: clientRangeHandlers.next},
    ];
  else
    keyMappings = [
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
        <RangeSelector options={RANGE_OPTIONS} selectedIndex={selectedRangeIndex} />
        <Box flexDirection="row" marginBottom={1}>
          <Box width={30}>
            <KeyValue
              label="Task Details:"
              items={[
                {key: 'Title', value: taskDetails.title},
                {key: 'Project', value: project?.name || 'Unknown'},
                {key: 'Client', value: client?.name || 'Unknown'},
                {key: 'Status', value: activeEntries > 0 ? <Text color="green">Active</Text> : 'Stopped'},
                {key: 'Estimation', value: formatEstimation(taskDetails.estimated_minutes) || <Text dimColor>None</Text>},
                {key: 'Total', value: <Text color={isOvertime ? 'red' : undefined}>{formatTime(totalSeconds) || '-'}</Text>},
              ]}
            />
          </Box>

          <Box width={35} marginLeft={2}>
            {analyticsLoading ? (
              <Text dimColor>Loading...</Text>
            ) : analytics ? (
              <KeyValue
                label={`Analytics (${analytics.meta.dateRangeDays}d):`}
                items={[
                  {key: 'Sessions', value: analytics.distribution.sessionCount},
                  {key: 'Days', value: `${analytics.distribution.daysWorked}/${analytics.distribution.dateRangeDays}`},
                  ...(analytics.distribution.peakHour !== null ? [{key: 'Peak', value: formatHour(analytics.distribution.peakHour)}] : []),
                  ...(analytics.distribution.deepWorkCount > 0 ? [{key: 'Deep Work', value: <Text color="green">{analytics.distribution.deepWorkCount}</Text>}] : []),
                  ...(analytics.distribution.lastActivityDate ? [{key: 'Last', value: formatRelativeTime(analytics.distribution.lastActivityDate)}] : []),
                ]}
              />
            ) : null}
          </Box>

          <Box width={25} marginLeft={2}>
            <Earnings pricing={pricing} loading={pricingLoading} />
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

            <ScrollBox
              height={Math.max(5, height - 30)}
              selectedIndex={selectedEntryIndex}
            >
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

  const renderProjectDetails = () => {
    const project = allProjects.find(p => p.id === selectedProjectId);
    if (!project) return <Text dimColor>Loading...</Text>;

    const client = clients.find(c => c.id === project.client_id);

    return (
      <Box flexDirection="column">
        <RangeSelector options={RANGE_OPTIONS} selectedIndex={projectRangeIndex} />
        <Box flexDirection="row">
          <Box width={30}>
            <KeyValue
              label="Project Details:"
              items={[
                {key: 'Name', value: project.name},
                {key: 'Client', value: client?.name || 'Unknown'},
              ]}
            />
          </Box>
          <Box width={30} marginLeft={2}>
            <Earnings pricing={projectPricing} loading={projectPricingLoading} />
          </Box>
        </Box>
      </Box>
    );
  };

  const renderClientDetails = () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return <Text dimColor>Loading...</Text>;

    return (
      <Box flexDirection="column">
        <RangeSelector options={RANGE_OPTIONS} selectedIndex={clientRangeIndex} />
        <Box flexDirection="row">
          <Box width={30}>
            <KeyValue
              label="Client Details:"
              items={[{key: 'Name', value: client.name}]}
            />
          </Box>
          <Box width={30} marginLeft={2}>
            <Earnings pricing={clientPricing} loading={clientPricingLoading} />
          </Box>
        </Box>
      </Box>
    );
  };

  const renderDashboard = () => {
    const activeTask = dashboardTasks.find(t => t.isActive);
    const totalSec = dashboardTasks.reduce((sum, t) => sum + t.totalSec, 0);

    const clientBreakdown = dashboardTasks.reduce((acc, task) => {
      const project = allProjects.find(p => p.id === task.projectId);
      const client = clients.find(c => c.id === project?.client_id);
      const clientName = client?.name || 'Unknown';

      if (!acc[clientName]) acc[clientName] = {totalSec: 0, taskCount: 0};
      acc[clientName].totalSec += task.totalSec;
      acc[clientName].taskCount += 1;
      return acc;
    }, {});

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <KeyValue
            label="Today's Dashboard:"
            items={[
              {key: 'Active', value: activeTask ? <Text color="green">{activeTask.title}</Text> : <Text dimColor>None</Text>},
              {key: 'Total', value: formatTime(totalSec) || '0h 0m'},
              {key: 'Tasks', value: dashboardTasks.length},
            ]}
          />
        </Box>

        {Object.keys(clientBreakdown).length > 0 && (
          <KeyValue
            label="Per Client:"
            items={Object.entries(clientBreakdown).map(([name, data]) => ({
              key: name,
              value: `${formatTime(data.totalSec) || '0m'} (${data.taskCount} task${data.taskCount !== 1 ? 's' : ''})`,
            }))}
          />
        )}
      </Box>
    );
  };

  const renderContent = () => {
    let activeRangeIndex;
    if (activeSection === 'task' && selectedTaskId && taskDetails && !isEditing)
      activeRangeIndex = selectedRangeIndex;
    else if (activeSection === 'project' && selectedProjectId)
      activeRangeIndex = projectRangeIndex;
    else if (activeSection === 'client' && selectedClientId)
      activeRangeIndex = clientRangeIndex;
    else
      activeRangeIndex = selectedRangeIndex;

    if (RANGE_OPTIONS[activeRangeIndex].type === 'dashboard') {
      return (
        <Box flexDirection="column">
          <RangeSelector options={RANGE_OPTIONS} selectedIndex={activeRangeIndex} />
          {renderDashboard()}
        </Box>
      );
    }

    if (isClientFocused) {
      if (selectedClientId) return renderClientDetails();
      if (clients.length > 0) {
        return (
          <SelectableList
            label="All Clients:"
            items={clients}
            selectedId={selectedClientId}
            getId={c => c.id}
            renderLabel={c => c.name}
          />
        );
      }
      return <Text dimColor>No clients found</Text>;
    }

    if (isProjectsFocused) {
      if (selectedProjectId) return renderProjectDetails();
      if (allProjects.length === 0)
        return <Text dimColor>No projects found</Text>;

      return (
        <SelectableList
          label="All Projects:"
          items={allProjects}
          selectedId={selectedProjectId}
          getId={p => p.id}
          renderLabel={p => {
            const client = clients.find(c => c.id === p.client_id);
            return <>{p.name}{client && <Text dimColor> ({client.name})</Text>}</>;
          }}
        />
      );
    }

    if (isTasksFocused) {
      if (selectedTaskId) return renderTaskDetails();
      if (allTasks.length === 0) return <Text dimColor>No tasks found</Text>;

      return (
        <SelectableList
          label="All Tasks:"
          items={allTasks.slice(0, 10)}
          selectedId={selectedTaskId}
          getId={t => t.id}
          renderLabel={t => {
            const project = allProjects.find(p => p.id === t.project_id);
            const client = clients.find(c => c.id === project?.client_id);
            return <>{t.title}{project && <Text dimColor> ({project.name}</Text>}{client && <Text dimColor> - {client.name})</Text>}</>;
          }}
        />
      );
    }

    if (isViewFocused) {
      if (lastSection === 'client' && selectedClientId) return renderClientDetails();
      if (lastSection === 'project' && selectedProjectId) return renderProjectDetails();
      if (selectedTaskId) return renderTaskDetails();
    }

    return renderDashboard();
  };

  const hasTimeEntries = timeEntries.length > 0;

  return (
    <Frame borderColor={borderColor} width={'100%'} height={height}>
      <Frame.Header>
        <Text color={borderColor} bold>
          {title}
          {taskDetails && (isTasksFocused || isViewFocused) && <Text dimColor> - {taskDetails.title}</Text>}
          {isProjectsFocused && selectedProjectId && <Text dimColor> - {allProjects.find(p => p.id === selectedProjectId)?.name}</Text>}
          {isClientFocused && selectedClientId && <Text dimColor> - {clients.find(c => c.id === selectedClientId)?.name}</Text>}
        </Text>
      </Frame.Header>
      <Frame.Body>{renderContent()}</Frame.Body>
      <Frame.Footer>
        {activeSection === 'task' && selectedTaskId && hasTimeEntries && (
          <HelpBottom>h/l:range j/k:entries e/E:edit d:delete</HelpBottom>
        )}
        {activeSection === 'project' && selectedProjectId && (
          <HelpBottom>h/l:range</HelpBottom>
        )}
        {activeSection === 'client' && selectedClientId && (
          <HelpBottom>h/l:range</HelpBottom>
        )}
      </Frame.Footer>
    </Frame>
  );
};

export default View;
