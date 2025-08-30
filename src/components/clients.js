import React, {useState} from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {useComponentKeys} from '../hooks/useComponentKeys.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, CLIENT} from '../consts.js';
import BasicTextInput from './BasicTextInput.js';
import HelpBottom from './HelpBottom.js';
import Frame from './Frame.js';
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
    if (selectedClient) {
      setIsEditing(true);
      setMessage('');
    } else {
      setMessage('No client selected to edit');
    }
  };

  const handleDeleteClient = () => {
    if (selectedClient) {
      setIsDeleting(true);
      setMessage('');
    } else {
      setMessage('No client selected to delete');
    }
  };

  const handleClientSubmit = async clientName => {
    if (clientName.trim()) {
      try {
        await clientService.create(clientName.trim());
        await reloadClients();
        const updatedClients = await clientService.selectAll();
        const newClient = updatedClients.find(
          c => c.name === clientName.trim(),
        );
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

  const handleDeleteConfirm = async confirmation => {
    if (
      confirmation.toLowerCase() === 'y' ||
      confirmation.toLowerCase() === 'yes'
    ) {
      try {
        await clientService.delete(selectedClient);
        await reloadClients();
        const updatedClients = await clientService.selectAll();
        if (updatedClients.length > 0) {
          setSelectedClientId(updatedClients[0].id);
        } else {
          setSelectedClientId(null);
        }
        setMessage('Client deleted successfully');
      } catch (error) {
        setMessage('Failed to delete client');
      }
    } else {
      setMessage('Delete cancelled');
    }
    setIsDeleting(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
    setMessage('Delete cancelled');
  };

  const handleEditSubmit = async newName => {
    if (newName.trim() && selectedClient) {
      try {
        await clientService.update(selectedClient.id, newName.trim());
        await reloadClients();
        const updatedClients = await clientService.selectAll();
        const updatedClient = updatedClients.find(
          c => c.id === selectedClient.id,
        );
        if (updatedClient) {
          setSelectedClientId(updatedClient.id);
        }
        setMessage('Client renamed successfully');
      } catch (error) {
        setMessage('Failed to rename client');
      }
    } else {
      setMessage('Invalid client name');
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setMessage('Edit cancelled');
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
      key: 'c',
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
    <Frame borderColor={borderColor} height={5}>
      <Frame.Header>
        <Text color={borderColor} bold>
          {title}
        </Text>
        {message && <Text color="yellow">{message}</Text>}
      </Frame.Header>
      <Frame.Body>
        {isAdding ? (
          <Box flexDirection="column">
            <Text>New client name:</Text>
            <BasicTextInput
              onSubmit={handleClientSubmit}
              onCancel={handleClientCancel}
            />
          </Box>
        ) : isDeleting ? (
          <Box flexDirection="column">
            <Text color="red">Delete "{selectedClient?.name}"? (y/n):</Text>
            <BasicTextInput
              onSubmit={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
            />
          </Box>
        ) : isEditing ? (
          <Box flexDirection="column">
            <Text>Edit client name:</Text>
            <BasicTextInput
              defaultValue={selectedClient?.name || ''}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
            />
          </Box>
        ) : (
          <>
            {selectedClient ? (
              <Text>{selectedClient.name}</Text>
            ) : (
              <Text dimColor>No clients found</Text>
            )}
          </>
        )}
      </Frame.Body>
      {isClientFocused && mode === 'normal' && !isAdding && !isDeleting && !isEditing && (
        <Frame.Footer>
          <HelpBottom>
            c:new e:edit d:delete j/k:nav
          </HelpBottom>
        </Frame.Footer>
      )}
    </Frame>
  );
};

export default Client;
