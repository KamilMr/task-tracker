import React from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, CLIENT} from '../consts.js';

const Client = () => {
  const {isClientFocused, getBorderTitle} = useNavigation();
  const borderColor = isClientFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(CLIENT);

  return (
    <Box borderColor={borderColor} borderStyle={'round'} flexDirection="column">
      <Text color={borderColor} bold>
        {title}
      </Text>
      <Text>Client content here</Text>
    </Box>
  );
};

export default Client;
