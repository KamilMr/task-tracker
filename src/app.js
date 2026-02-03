import React from 'react';
import {Box} from 'ink';
import Client from './components/clients.js';
import Projects from './components/projects.js';
import Tasks from './components/tasks.js';
import View from './components/view.js';
import StatusBar from './components/StatusBar.js';
import {NavigationProvider} from './contexts/NavigationContext.js';
import {DataProvider} from './contexts/DataContext.js';
import useTerminalSize from './hooks/useTerminalSize.js';
import pkg from '../package.json' with {type: 'json'};

const LAYOUT = {
  leftColumnWidth: 40,
  clientHeight: 10,
  projectHeight: 40,
  taskHeight: 50,
};

const AppContent = () => {
  const [, rows] = useTerminalSize();

  const clientHeight = Math.floor((rows * LAYOUT.clientHeight) / 100);
  const projectHeight = Math.floor((rows * LAYOUT.projectHeight) / 100);
  const taskHeight = Math.floor((rows * LAYOUT.taskHeight) / 100);

  const mainHeight = rows - 1;

  return (
    <Box height={rows} flexDirection="column">
      <StatusBar version={pkg.version} />
      <Box height={mainHeight}>
        <Box width={`${LAYOUT.leftColumnWidth}%`} flexDirection="column">
          <Client height={clientHeight} />
          <Projects height={projectHeight} />
          <Tasks height={taskHeight} />
        </Box>
        <Box flexGrow={1}>
          <View height={mainHeight} />
        </Box>
      </Box>
    </Box>
  );
};

const App = () => (
  <DataProvider>
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  </DataProvider>
);

export default App;
