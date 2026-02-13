import React from 'react';
import {Text, Box} from 'ink';

const SelectableList = ({label, items, selectedId, getId, renderLabel}) => (
  <Box flexDirection="column">
    <Text color="cyan" bold>{label}</Text>
    {items.map(item => {
      const id = getId(item);
      const isSelected = id === selectedId;
      return (
        <Text key={id} color={isSelected ? 'green' : 'white'}>
          {isSelected ? '• ' : '  '}{renderLabel(item)}
        </Text>
      );
    })}
  </Box>
);

export default SelectableList;
