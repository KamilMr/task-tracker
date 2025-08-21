import React from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {
  BORDER_COLOR_DEFAULT,
  BORDER_COLOR_FOCUSED,
  PROJECTS,
} from '../consts.js';

const Projects = () => {
  const {isProjectsFocused, getBorderTitle} = useNavigation();
  const borderColor = isProjectsFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(PROJECTS);

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
      <Text>Projects content here</Text>
    </Box>
  );
};

export default Projects;
