import React, {useState} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {
  BORDER_COLOR_DEFAULT,
  BORDER_COLOR_FOCUSED,
  PROJECTS,
} from '../consts.js';

const Projects = () => {
  const {isProjectsFocused, getBorderTitle, mode} = useNavigation();
  const [message, setMessage] = useState('Projects content here');
  
  const borderColor = isProjectsFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(PROJECTS);

  const handleNewProject = () => {
    setMessage('New project action triggered');
  };

  const handleEditProject = () => {
    setMessage('Edit project action triggered');
  };

  const handleDeleteProject = () => {
    setMessage('Delete project action triggered');
  };

  const handleAssignClient = () => {
    setMessage('Assign client action triggered');
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
      key: 'a',
      action: handleAssignClient,
    },
  ];

  useComponentKeys(PROJECTS, keyMappings, isProjectsFocused);

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
      <Text>{message}</Text>
      {isProjectsFocused && mode === 'normal' && (
        <Text dimColor>n:new e:edit d:delete a:assign</Text>
      )}
    </Box>
  );
};

export default Projects;
