import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';
import Fuse from 'fuse.js';
import taskService from '../services/taskService.js';

const AutocompleteTextInput = ({
  defaultValue = '',
  projectId,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {setMode} = useNavigation();

  // Fetch suggestions on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (projectId) {
        const suggestions = await taskService.getTaskSuggestions(projectId);
        setAllSuggestions(suggestions);
      }
    };

    setMode('insert');
    setValue(defaultValue);
    fetchSuggestions();
  }, [setMode, defaultValue, projectId]);

  // Filter suggestions whenever value changes
  useEffect(() => {
    if (!value.trim() || allSuggestions.length === 0) {
      setFilteredSuggestions([]);
      setSelectedIndex(0);
      return;
    }

    const fuse = new Fuse(allSuggestions, {
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });

    const results = fuse.search(value);
    const matches = results.slice(0, 5).map(result => result.item);
    setFilteredSuggestions(matches);
    setSelectedIndex(0);
  }, [value, allSuggestions]);

  useInput((input, key) => {
    // Handle arrow navigation only when suggestions are visible
    if (filteredSuggestions.length > 0) {
      if (key.downArrow) {
        setSelectedIndex(prev =>
          Math.min(prev + 1, filteredSuggestions.length - 1),
        );
        return;
      }

      if (key.upArrow) {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        return;
      }

      // Tab to accept selected suggestion
      if (key.tab) {
        setValue(filteredSuggestions[selectedIndex]);
        return;
      }
    }

    if (key.return) {
      // Use the typed value directly
      onSubmit(value);
      setValue('');
      setMode('normal');
      return;
    }

    if (key.escape) {
      onCancel();
      setValue('');
      setMode('normal');
      return;
    }

    if (key.backspace || key.delete) {
      setValue(prev => prev.slice(0, -1));
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      setValue(prev => prev + input);
    }
  });

  return (
    <Box flexDirection="column">
      <Text>
        {value}
        <Text inverse> </Text>
      </Text>
      {filteredSuggestions.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {filteredSuggestions.map((suggestion, index) => (
            <Text
              key={index}
              color={index === selectedIndex ? 'green' : 'gray'}
            >
              {index === selectedIndex ? '→ ' : '  '}
              {suggestion}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AutocompleteTextInput;
