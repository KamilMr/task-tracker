import React, {useState, useEffect} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {useData} from '../contexts/DataContext.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {
  BORDER_COLOR_DEFAULT,
  BORDER_COLOR_FOCUSED,
  PROJECTS,
} from '../consts.js';
import BasicTextInput from './BasicTextInput.js';
import DelayedDisappear from './DelayedDisappear.js';
import HelpBottom from './HelpBottom.js';
import Frame from './Frame.js';
import ScrollBox from './ScrollBox.js';
import projectService from '../services/projectService.js';
import clientService from '../services/clientService.js';

const Projects = ({height}) => {
  const {isProjectsFocused, getBorderTitle, mode} = useNavigation();
  const {
    selectedClientId,
    selectedProjectId,
    setSelectedProjectId,
    reload,
    triggerReload,
  } = useData();

  const [projects, setProjects] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      if (!selectedClientId) {
        setProjects([]);
        setSelectedClient(null);
        return;
      }
      const [projectData, clientData] = await Promise.all([
        projectService.selectByCliId(selectedClientId),
        clientService.selectById(selectedClientId),
      ]);
      setProjects(projectData);
      setSelectedClient(clientData);
      if (projectData.length > 0 && !selectedProjectId)
        setSelectedProjectId(projectData[0].id);
    };
    loadProjects();
  }, [selectedClientId, reload]);

  const selectedProject =
    projects.find(p => p.id === selectedProjectId) || null;

  const selectNextProject = () => {
    const currentIndex = projects.findIndex(p => p.id === selectedProjectId);
    const nextIndex = currentIndex < projects.length - 1 ? currentIndex + 1 : 0;
    if (projects[nextIndex]) setSelectedProjectId(projects[nextIndex].id);
  };

  const selectPreviousProject = () => {
    const currentIndex = projects.findIndex(p => p.id === selectedProjectId);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : projects.length - 1;
    if (projects[prevIndex]) setSelectedProjectId(projects[prevIndex].id);
  };

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

  const handleDeleteProject = () => {
    if (!selectedProjectId) {
      setMessage('No project selected');
      return;
    }
    setIsDeleting(true);
    setMessage('');
  };

  const handleDeleteConfirm = async confirmation => {
    if (
      confirmation.toLowerCase() === 'y' ||
      confirmation.toLowerCase() === 'yes'
    ) {
      try {
        await projectService.delete(selectedProject);
        triggerReload();
        setMessage(`Deleted project: ${selectedProject.name}`);
      } catch (error) {
        setMessage(`Error deleting project: ${error.message}`);
      }
    } else {
      setMessage('Delete cancelled');
    }
    setIsDeleting(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
    setMessage('Delete cancelled');
  };

  const handleCreateSubmit = async name => {
    if (!name.trim()) return;
    try {
      await projectService.create(name.trim(), selectedClientId);
      triggerReload();
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
      triggerReload();
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

  const keyMappings = [
    {key: 'c', action: handleNewProject},
    {key: 'e', action: handleEditProject},
    {key: 'd', action: handleDeleteProject},
    {key: 'j', action: selectNextProject},
    {key: 'k', action: selectPreviousProject},
  ];

  useComponentKeys(PROJECTS, keyMappings, isProjectsFocused);

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

    if (isDeleting) {
      return (
        <Box flexDirection="column">
          <Text color="red">Delete "{selectedProject?.name}"? (y/n):</Text>
          <BasicTextInput
            onSubmit={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
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
          <Text dimColor>Press 'c' to create a new project</Text>
        </Box>
      );
    }

    const selectedIndex = projects.findIndex(p => p.id === selectedProjectId);

    return (
      <Box flexDirection="column">
        <Text color="cyan" bold>
          {selectedClient.name} Projects:
        </Text>
        <ScrollBox
          height={Math.max(1, height - 5)}
          selectedIndex={selectedIndex}
        >
          {projects.map(project => (
            <Text
              key={project.id}
              color={project.id === selectedProjectId ? 'green' : 'white'}
            >
              {project.id === selectedProjectId ? '• ' : '  '}
              {project.name}
            </Text>
          ))}
        </ScrollBox>
      </Box>
    );
  };

  const isInEditMode = isCreating || isEditing || isDeleting;
  const projectCount = projects.length;

  return (
    <Frame borderColor={borderColor} height={height}>
      <Frame.Header>
        <Text color={borderColor} bold>
          {title}
          {projectCount > 0 && <Text dimColor> - {projectCount}</Text>}
        </Text>
        <DelayedDisappear key={message}>
          <Text color="yellow">{message}</Text>
        </DelayedDisappear>
      </Frame.Header>
      <Frame.Body>{renderContent()}</Frame.Body>
      <Frame.Footer>
        {isProjectsFocused && mode === 'normal' && !isInEditMode && (
          <HelpBottom>j/k:navigate c:new e:edit d:delete</HelpBottom>
        )}
      </Frame.Footer>
    </Frame>
  );
};

export default Projects;
