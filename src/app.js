import React from 'react';
import {Box} from 'ink';
import Client from './components/clients.js';
import Projects from './components/projects.js';
import Tasks from './components/tasks.js';
import View from './components/view.js';
import {NavigationProvider} from './contexts/NavigationContext.js';
import {DataProvider} from './contexts/DataContext.js';
import useTerminalSize from './hooks/useTerminalSize.js';

const LAYOUT = {
  leftColumnWidth: 30,
  clientHeight: 10,
  projectHeight: 40,
  taskHeight: 50,
};

const AppContent = () => {
  const [, rows] = useTerminalSize();

  const clientHeight = Math.floor((rows * LAYOUT.clientHeight) / 100);
  const projectHeight = Math.floor((rows * LAYOUT.projectHeight) / 100);
  const taskHeight = Math.floor((rows * LAYOUT.taskHeight) / 100);

  return (
    <Box height={rows}>
      <Box width={`${LAYOUT.leftColumnWidth}%`} flexDirection="column">
        <Client height={clientHeight} />
        <Projects height={projectHeight} />
        <Tasks height={taskHeight} />
      </Box>
      <Box flexGrow={1}>
        <View height={rows} />
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
