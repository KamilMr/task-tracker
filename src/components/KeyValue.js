import React from 'react';
import {Text, Box} from 'ink';

const KeyValue = ({label, items}) => (
  <Box flexDirection="column">
    {label && <Text color="cyan" bold>{label}</Text>}
    {items.map(({key, value}) => (
      <Text key={key}>
        <Text bold>{key}: </Text>
        {value}
      </Text>
    ))}
  </Box>
);

export default KeyValue;
