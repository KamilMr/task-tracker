import React, {useEffect} from 'react';
import {Text, Box} from 'ink';
import Client from './components/clients.js';
import DetailsView from './components/detailsView.js';
import {NavigationProvider, useNavigation} from './contexts/NavigationContext.js';

const Clock = () => {
  const [time, setTime] = React.useState(new Date().toLocaleTimeString());
  useEffect(() => {
    // create a simle clock here
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <Text color="green">{time}</Text>;
};

const AppContent = () => {
  const {isCommandsFocused, isSummaryFocused} = useNavigation();
  
  return (
    <Box flexDirection="column">
      <Box>
        <Box 
          marginLeft={1} 
          borderStyle={isCommandsFocused ? 'round' : 'single'} 
          borderColor={isCommandsFocused ? 'green' : 'gray'}> 
          <Client />
        </Box>
      </Box>
      <Box marginTop={2} borderStyle={isSummaryFocused ? 'round' : 'single'} borderColor={isSummaryFocused ? 'green' : 'gray'}>
        <DetailsView />
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
};

export default App;
