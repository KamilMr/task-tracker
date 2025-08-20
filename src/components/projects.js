import React from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED} from '../consts.js';

const Projects = () => {
  const {isProjectsFocused} = useNavigation();
  const borderColor = isProjectsFocused ? BORDER_COLOR_FOCUSED : BORDER_COLOR_DEFAULT;

  return (
    <Box borderColor={borderColor} borderStyle={'round'} height={20}>
      <Text bold>Projects:</Text>
    </Box>
  );
};

export default Projects;
