import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {useNavigation} from '../../contexts/NavigationContext.js';

const EstimationEditingForm = ({
  defaultValue,
  taskTitle,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue || '');
  const {setMode} = useNavigation();

  useEffect(() => {
    setMode('insert');
    setValue(defaultValue || '');
  }, [setMode, defaultValue]);

  const parseEstimation = input => {
    if (!input || input.trim() === '') return null;

    const trimmed = input.trim().toLowerCase();

    // Parse just minutes "30m" or "1m" - check first!
    const minMatch = trimmed.match(/^(\d+)\s*m$/);
    if (minMatch) return parseInt(minMatch[1], 10);

    // Parse formats like "2h", "2h30m", "1.5h"
    const hourMinMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*h\s*(\d+)?\s*m?$/);
    if (hourMinMatch) {
      const hours = parseFloat(hourMinMatch[1]);
      const minutes = hourMinMatch[2] ? parseInt(hourMinMatch[2], 10) : 0;
      return Math.round(hours * 60 + minutes);
    }

    // Parse plain number as minutes
    const numMatch = trimmed.match(/^(\d+)$/);
    if (numMatch) return parseInt(numMatch[1], 10);

    return null;
  };

  useInput((input, key) => {
    if (key.return) {
      const hours = parseEstimation(value);
      onSubmit(hours);
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

    if (input && !key.ctrl && !key.meta) setValue(prev => prev + input);
  });

  return (
    <Box flexDirection="column">
      <Text>Set estimation for: {taskTitle}</Text>
      <Text dimColor>Format: 2h, 1h30m, 30m, or empty to clear</Text>
      <Text>
        {value}
        <Text inverse> </Text>
      </Text>
    </Box>
  );
};

export default EstimationEditingForm;
