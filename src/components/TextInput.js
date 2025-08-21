import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';

const TextInput = ({title, placeholder = '', onSubmit, onCancel}) => {
  const [value, setValue] = useState('');
  const {setMode, mode} = useNavigation();

  useEffect(() => {
    setMode('insert');
    setValue('');
  }, [setMode]);

  useInput((input, key) => {
    if (key.return) {
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
    <Box
      borderStyle="double"
      borderColor="yellow"
      flexDirection="column"
      padding={1}
      width={60}
      height={10}
    >
      <Text bold color="yellow">
        {title}
      </Text>
      <Text dimColor>
        {placeholder}
      </Text>
      <Box borderStyle="single" borderColor="gray" marginTop={1} padding={1}>
        <Text>
          {value}
          <Text inverse> </Text>
        </Text>
      </Box>
      <Text dimColor marginTop={1}>
        Enter: Submit | Esc: Cancel
      </Text>
    </Box>
  );
};

export default TextInput;
