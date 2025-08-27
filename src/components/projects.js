import React, {useState, useEffect} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {
  BORDER_COLOR_DEFAULT,
  BORDER_COLOR_FOCUSED,
  PROJECTS,
} from '../consts.js';
import BasicTextInput from './BasicTextInput.js';
import projectService from '../services/projectService.js';

const Projects = () => {
  const {
    isProjectsFocused,
    getBorderTitle,
    mode,
    projects,
    selectedProjectId,
    getSelectedProject,
    selectNextProject,
    selectPreviousProject,
    selectedClientId,
    getSelectedClient,
    reloadProjects,
  } = useNavigation();
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const borderColor = isProjectsFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(PROJECTS);

  const handleNewProject = () => {
    if (!selectedClientId) {
      setMessage('Select a client first');
      return;
    }
    setIsCreating(true);
    setMessage('');
  };

  const handleEditProject = () => {
    if (!selectedProjectId) {
      setMessage('No project selected');
      return;
    }
    setIsEditing(true);
    setMessage('');
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) {
      setMessage('No project selected');
      return;
    }
    try {
      const project = getSelectedProject();
      await projectService.delete(project);
      await reloadProjects();
      setMessage(`Deleted project: ${project.name}`);
    } catch (error) {
      setMessage(`Error deleting project: ${error.message}`);
    }
  };

  const handleCreateSubmit = async name => {
    if (!name.trim()) return;
    try {
      await projectService.create(name.trim(), selectedClientId);
      await reloadProjects();
      setIsCreating(false);
      setMessage(`Created project: ${name}`);
    } catch (error) {
      setMessage(`Error creating project: ${error.message}`);
    }
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    setMessage('');
  };

  const handleEditSubmit = async name => {
    if (!name.trim()) return;
    try {
      await projectService.update(selectedProjectId, name.trim());
      await reloadProjects();
      setIsEditing(false);
      setMessage(`Updated project: ${name}`);
    } catch (error) {
      setMessage(`Error updating project: ${error.message}`);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setMessage('');
  };

  // Project key mappings (normal mode only)
  const keyMappings = [
    {
      key: 'n',
      action: handleNewProject,
    },
    {
      key: 'e',
      action: handleEditProject,
    },
    {
      key: 'd',
      action: handleDeleteProject,
    },
    {
      key: 'j',
      action: selectNextProject,
    },
    {
      key: 'k',
      action: selectPreviousProject,
    },
  ];

  useComponentKeys(PROJECTS, keyMappings, isProjectsFocused);

  const selectedClient = getSelectedClient();
  const selectedProject = getSelectedProject();

  const renderContent = () => {
    if (isCreating) {
      return (
        <Box flexDirection="column">
          <Text>New project name:</Text>
          <BasicTextInput
            onSubmit={handleCreateSubmit}
            onCancel={handleCreateCancel}
          />
        </Box>
      );
    }

    if (isEditing) {
      return (
        <Box flexDirection="column">
          <Text>Edit project name:</Text>
          <BasicTextInput
            defaultValue={selectedProject?.name || ''}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
          />
        </Box>
      );
    }

    if (!selectedClient) {
      return <Text dimColor>Select a client to view projects</Text>;
    }

    if (projects.length === 0) {
      return (
        <Box flexDirection="column">
          <Text dimColor>No projects for {selectedClient.name}</Text>
          <Text dimColor>Press 'n' to create a new project</Text>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Text color="cyan" bold>
          {selectedClient.name} Projects:
        </Text>
        {projects.map(project => (
          <Text
            key={project.id}
            color={project.id === selectedProjectId ? 'green' : 'white'}
          >
            {project.id === selectedProjectId ? '• ' : '  '}
            {project.name}
          </Text>
        ))}
      </Box>
    );
  };

  return (
    <Box
      borderColor={borderColor}
      borderStyle={'round'}
      minHeight={20}
      flexDirection="column"
    >
      <Text color={borderColor} bold>
        {title}
      </Text>
      {message && <Text color="yellow">{message}</Text>}
      {renderContent()}
      {isProjectsFocused && mode === 'normal' && !isCreating && !isEditing && (
        <Text dimColor>j/k:navigate n:new e:edit d:delete</Text>
      )}
    </Box>
  );
};

export default Projects;
