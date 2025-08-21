import React from 'react';
import {Text, Box} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import {BORDER_COLOR_DEFAULT, BORDER_COLOR_FOCUSED, VIEW} from '../consts.js';

const View = () => {
  const {
    isViewFocused,
    isClientFocused,
    getBorderTitle,
    clients,
    selectedClientId,
  } = useNavigation();
  const borderColor = isViewFocused
    ? BORDER_COLOR_FOCUSED
    : BORDER_COLOR_DEFAULT;
  const title = getBorderTitle(VIEW);

  const renderContent = () => {
    if (isClientFocused && clients.length > 0) {
      return (
        <Box flexDirection="column">
          <Text color="cyan" bold>
            All Clients:
          </Text>
          {clients.map(client => (
            <Text
              key={client.id}
              color={client.id === selectedClientId ? 'green' : 'white'}
            >
              {client.id === selectedClientId ? '• ' : '  '}
              {client.name}
            </Text>
          ))}
        </Box>
      );
    }
    
    return <Text>View content here</Text>;
  };

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
      {renderContent()}
    </Box>
  );
};

export default View;
