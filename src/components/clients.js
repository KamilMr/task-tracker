import React, {useState} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, CLIENT} from '../consts.js';

const Client = () => {
  const {isClientFocused, getBorderTitle, mode} = useNavigation();
  const [message, setMessage] = useState('Client content here');

  const borderColor = isClientFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(CLIENT);

  const handleNewClient = () => {
    setMessage('New client action triggered');
  };

  const handleEditClient = () => {
    setMessage('Edit client action triggered');
  };

  const handleDeleteClient = () => {
    setMessage('Delete client action triggered');
  };

  // Client key mappings (normal mode only)
  const keyMappings = [
    {
      key: 'n',
      action: handleNewClient,
    },
    {
      key: 'e',
      action: handleEditClient,
    },
    {
      key: 'd',
      action: handleDeleteClient,
    },
  ];

  useComponentKeys(CLIENT, keyMappings, isClientFocused);

  return (
    <Box borderColor={borderColor} borderStyle={'round'} flexDirection="column">
      <Text color={borderColor} bold>
        {title}
      </Text>
      <Text>{message}</Text>
      {isClientFocused && mode === 'normal' && (
        <Text dimColor>n:new e:edit d:delete</Text>
      )}
    </Box>
  );
};

export default Client;
