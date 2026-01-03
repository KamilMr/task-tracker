import React from 'react';
import {Text} from 'ink';

const Clock = () => {
  const [time, setTime] = React.useState(new Date().toLocaleTimeString());
  React.useEffect(() => {
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

export default Clock;
