import React from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED} from '../consts.js';

const Client = () => {
  const {isClientFocused} = useNavigation();
  const borderColor = isClientFocused ? BORDER_COLOR_FOCUSED : BORDER_COLOR_DEFAULT;

  return (
    <Box borderColor={borderColor} borderStyle={'round'}>
      <Text>Client</Text>
    </Box>
  );
};

export default Client;
