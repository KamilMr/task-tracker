import React from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED} from '../consts.js';

const View = () => {
  const {isViewFocused} = useNavigation();
  const borderColor = isViewFocused ? BORDER_COLOR_FOCUSED : BORDER_COLOR_DEFAULT;

  return (
    <Box borderColor={borderColor} borderStyle={'round'} width={'100%'}>
      <Text bold>View:</Text>
    </Box>
  );
};

export default View;
