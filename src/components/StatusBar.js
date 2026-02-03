import React from 'react';
import {Box, Text} from 'ink';

const StatusBar = ({version}) => (
  <Box width="100%" justifyContent="flex-end">
    <Text dimColor>v{version}</Text>
  </Box>
);

export default StatusBar;
