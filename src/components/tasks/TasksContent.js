import React from 'react';
import {Text, Box} from 'ink';
import TaskCreatingForm from './TaskCreatingForm.js';
import TaskEditingForm from './TaskEditingForm.js';
import EstimationEditingForm from './EstimationEditingForm.js';
import NoProjectSelected from './NoProjectSelected.js';
import NoTasksFound from './NoTasksFound.js';
import TasksList from './TasksList.js';
import BasicTextInput from '../BasicTextInput.js';
import {formatEstimation} from '../../utils.js';

const TasksContent = ({
  isCreating,
  isEditing,
  isEditingEstimation,
  isDeleting,
  dateTasks,
  selectedProject,
  selectedTaskId,
  selectedTaskTitle,
  selectedTaskEstimationMinutes,
  dateDisplay,
  isT1,
  handleCreateSubmit,
  handleCreateCancel,
  handleEditSubmit,
  handleEditCancel,
  handleEstimationSubmit,
  handleEstimationCancel,
  handleDeleteConfirm,
  handleDeleteCancel,
}) => {
  if (isCreating) {
    return (
      <TaskCreatingForm
        projectId={selectedProject?.id}
        onSubmit={handleCreateSubmit}
        onCancel={handleCreateCancel}
      />
    );
  }

  if (isEditing) {
    return (
      <TaskEditingForm
        defaultValue={selectedTaskTitle}
        onSubmit={handleEditSubmit}
        onCancel={handleEditCancel}
      />
    );
  }

  if (isEditingEstimation) {
    return (
      <EstimationEditingForm
        defaultValue={formatEstimation(selectedTaskEstimationMinutes) || ''}
        taskTitle={selectedTaskTitle}
        onSubmit={handleEstimationSubmit}
        onCancel={handleEstimationCancel}
      />
    );
  }

  if (isDeleting) {
    return (
      <Box flexDirection="column">
        <Text color="red">Delete "{selectedTaskTitle}"? (y/n):</Text>
        <BasicTextInput
          onSubmit={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </Box>
    );
  }

  if (!selectedProject) return <NoProjectSelected />;

  if (dateTasks.length === 0) {
    return (
      <NoTasksFound
        projectName={selectedProject.name}
        dateDisplay={dateDisplay}
      />
    );
  }

  return (
    <TasksList
      selectedProject={selectedProject}
      dateDisplay={dateDisplay}
      dateTasks={dateTasks}
      selectedTaskId={selectedTaskId}
      isT1={isT1}
    />
  );
};

export default TasksContent;
