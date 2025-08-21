import React, {useState} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, CLIENT} from '../consts.js';
import BasicTextInput from './BasicTextInput.js';
import clientService from '../services/clientService.js';

const Client = () => {
  const {
    isClientFocused,
    getBorderTitle,
    mode,
    getSelectedClient,
    selectNextClient,
    selectPreviousClient,
    setSelectedClientId,
    reloadClients,
  } = useNavigation();
  const [message, setMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const selectedClient = getSelectedClient();

  const borderColor = isClientFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(CLIENT);

  const handleNewClient = () => {
    setIsAdding(true);
    setMessage('');
  };

  const handleEditClient = () => {
    setMessage('Edit client action triggered');
  };

  const handleDeleteClient = () => {
    setMessage('Delete client action triggered');
  };

  const handleClientSubmit = async (clientName) => {
    if (clientName.trim()) {
      try {
        await clientService.create(clientName.trim());
        await reloadClients();
        const updatedClients = await clientService.selectAll();
        const newClient = updatedClients.find(c => c.name === clientName.trim());
        if (newClient) {
          setSelectedClientId(newClient.id);
        }
        setMessage('Client added successfully');
      } catch (error) {
        setMessage('Failed to add client');
      }
    }
    setIsAdding(false);
  };

  const handleClientCancel = () => {
    setIsAdding(false);
    setMessage('');
  };

  const handleNavigateDown = () => {
    selectNextClient();
    setMessage('');
  };

  const handleNavigateUp = () => {
    selectPreviousClient();
    setMessage('');
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
    {
      key: 'j',
      action: handleNavigateDown,
    },
    {
      key: 'k',
      action: handleNavigateUp,
    },
  ];

  useComponentKeys(CLIENT, keyMappings, isClientFocused);

  return (
    <Box borderColor={borderColor} borderStyle={'round'} flexDirection="column">
      <Text color={borderColor} bold>
        {title}
      </Text>
      {isAdding ? (
        <Box flexDirection="column">
          <Text>New client name:</Text>
          <BasicTextInput
            onSubmit={handleClientSubmit}
            onCancel={handleClientCancel}
          />
        </Box>
      ) : (
        <>
          {selectedClient ? (
            <Text>{selectedClient.name}</Text>
          ) : (
            <Text dimColor>No clients found</Text>
          )}
          {message && <Text color="yellow">{message}</Text>}
          {isClientFocused && mode === 'normal' && (
            <Text dimColor>n:new e:edit d:delete j/k:nav</Text>
          )}
        </>
      )}
    </Box>
  );
};

export default Client;
