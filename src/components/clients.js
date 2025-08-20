import React from 'react';
import {Text, Box} from 'ink';

const Clients = () => {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Basic Commands:</Text>
      <Text>• Create task: task create</Text>
      <Text>• Remove task: task remove</Text>
      <Text>• List tasks: task list</Text>
      <Text>• Update task: task update</Text>
    </Box>
  );
};

export default Clients;
