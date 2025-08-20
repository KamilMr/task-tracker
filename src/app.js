import React, {useEffect} from 'react';
import {Text, Box} from 'ink';
import Client from './components/clients.js';
import Projects from './components/projects.js';
import Tasks from './components/tasks.js';
import View from './components/view.js';
import {
  NavigationProvider,
  useNavigation,
} from './contexts/NavigationContext.js';

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

const LeftColumn = ({children}) => {
  return <Box width={'40%'}>{children}</Box>;
};
const RightColumn = ({children}) => {
  return <Box width={'100%'}>{children}</Box>;
};

const AppContent = () => {

  return (
    <Box>
      <LeftColumn>
        <Box flexDirection="column" width={'100%'}>
          <Client />
          <Projects />
          <Tasks />
        </Box>
      </LeftColumn>
      <RightColumn>
        <View />
      </RightColumn>
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
