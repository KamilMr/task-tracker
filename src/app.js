import React from 'react';
import {Box} from 'ink';
import Client from './components/clients.js';
import Projects from './components/projects.js';
import Tasks from './components/tasks.js';
import View from './components/view.js';
import {NavigationProvider} from './contexts/NavigationContext.js';
import {DataProvider} from './contexts/DataContext.js';

const LeftColumn = ({children}) => <Box width={'40%'}>{children}</Box>;
const RightColumn = ({children}) => <Box width={'100%'}>{children}</Box>;

const AppContent = () => (
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

const App = () => (
  <DataProvider>
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  </DataProvider>
);

export default App;
