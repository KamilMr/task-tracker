import React, {useEffect, useState} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, VIEW} from '../consts.js';
import projectService from '../services/projectService.js';

const View = () => {
  const {
    isViewFocused,
    isClientFocused,
    isProjectsFocused,
    getBorderTitle,
    clients,
    selectedClientId,
    selectedProjectId,
  } = useNavigation();
  const [allProjects, setAllProjects] = useState([]);

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

  const borderColor = isViewFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(VIEW);

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
    
    return <Text>View content here</Text>;
  };

  return (
    <Box
      borderColor={borderColor}
      borderStyle={'round'}
      width={'100%'}
      flexDirection="column"
    >
      <Text color={borderColor} bold>
        {title}
      </Text>
      {renderContent()}
    </Box>
  );
};

export default View;
