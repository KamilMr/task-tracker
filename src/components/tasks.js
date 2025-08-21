import React from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, TASKS} from '../consts.js';

const Tasks = () => {
  const {isTasksFocused, getBorderTitle} = useNavigation();
  const borderColor = isTasksFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(TASKS);

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
      <Text>Tasks content here</Text>
    </Box>
  );
};

export default Tasks;
