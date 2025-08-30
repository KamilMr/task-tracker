import React from 'react';
import TaskCreatingForm from './TaskCreatingForm.js';
import TaskEditingForm from './TaskEditingForm.js';
import NoProjectSelected from './NoProjectSelected.js';
import NoTasksFound from './NoTasksFound.js';
import TasksList from './TasksList.js';

const TasksContent = ({
  isCreating,
  isEditing,
  dateTasks,
  selectedProject,
  selectedTaskName,
  dateDisplay,
  isDiff,
  handleCreateSubmit,
  handleCreateCancel,
  handleEditSubmit,
  handleEditCancel,
}) => {
  if (isCreating) {
    return (
      <TaskCreatingForm
        onSubmit={handleCreateSubmit}
        onCancel={handleCreateCancel}
      />
    );
  }

  if (isEditing) {
    return (
      <TaskEditingForm
        defaultValue={selectedTaskName}
        onSubmit={handleEditSubmit}
        onCancel={handleEditCancel}
      />
    );
  }

  if (!selectedProject) {
    return <NoProjectSelected />;
  }

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
      selectedTaskName={selectedTaskName}
      isDiff={isDiff}
    />
  );
};

export default TasksContent;
