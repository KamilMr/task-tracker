import React from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, VIEW} from '../consts.js';

const View = () => {
  const {isViewFocused, getBorderTitle} = useNavigation();
  const borderColor = isViewFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(VIEW);

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
      <Text>View content here</Text>
    </Box>
  );
};

export default View;
