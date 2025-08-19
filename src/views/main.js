import React, {useEffect} from 'react';
import {Text, Box} from 'ink';
import TimerView from '../components/main/timer.js';
import DaySummary from '../components/main/day-summary.js';

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

const App = () => {
  return (
    <Box flexDirection="column">
      <Box>
        <Clock />
        <Box marginLeft={1}>
          <TimerView />
        </Box>
      </Box>
      <Box marginTop={2}>
        <DaySummary />
      </Box>
    </Box>
  );
};

export default App;
