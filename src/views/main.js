import React, {useEffect} from 'react';
import {Text, Box} from 'ink';
import CommandsView from '../components/main/commands.js';
import DaySummary from '../components/main/day-summary.js';
import {NavigationProvider, useNavigation} from '../contexts/NavigationContext.js';

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
        <Clock />
        <Box marginLeft={1} borderStyle={isCommandsFocused ? 'round' : 'single'} borderColor={isCommandsFocused ? 'green' : 'gray'}>
          <CommandsView />
        </Box>
      </Box>
      <Box marginTop={2} borderStyle={isSummaryFocused ? 'round' : 'single'} borderColor={isSummaryFocused ? 'green' : 'gray'}>
        <DaySummary />
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
