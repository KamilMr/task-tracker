import React, {useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {useNavigation} from '../../contexts/NavigationContext.js';

const CATEGORIES = [
  {key: 'i', name: 'integration', color: 'magenta'},
  {key: 'f', name: 'feature', color: 'green'},
  {key: 'u', name: 'ui', color: 'blue'},
  {key: 'x', name: 'fix', color: 'red'},
  {key: 'r', name: 'refactor', color: 'yellow'},
  {key: 'c', name: 'config', color: 'cyan'},
];

const CategoryQuickSelect = ({currentCategory, onSelect, onCancel}) => {
  const {setMode} = useNavigation();

  useEffect(() => {
    setMode('insert');
    return () => setMode('normal');
  }, [setMode]);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    const category = CATEGORIES.find(c => c.key === input?.toLowerCase());
    if (category) {
      onSelect(category.name);
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold>Select category:</Text>
      <Text> </Text>
      {CATEGORIES.map(cat => (
        <Box key={cat.name}>
          <Text color={cat.color}>
            {'  '}[{cat.key}] {cat.name}
            {currentCategory === cat.name && <Text dimColor> (current)</Text>}
          </Text>
        </Box>
      ))}
      <Text> </Text>
      <Text dimColor>Press key to select, Esc to cancel</Text>
    </Box>
  );
};

export default CategoryQuickSelect;
