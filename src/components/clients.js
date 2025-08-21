import React, {useState} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, CLIENT} from '../consts.js';

const Client = () => {
  const {isClientFocused, getBorderTitle} = useNavigation();
  const [testMessage, setTestMessage] = useState('Client content here');

  const borderColor = isClientFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(CLIENT);

  // Test key mappings
  const keyMappings = [
    {
      key: 't',
      action: () => setTestMessage('Test key pressed!'),
    },
  ];

  useComponentKeys(CLIENT, keyMappings, isClientFocused);

  return (
    <Box borderColor={borderColor} borderStyle={'round'} flexDirection="column">
      <Text color={borderColor} bold>
        {title}
      </Text>
      <Text>{testMessage}</Text>
    </Box>
  );
};

export default Client;
