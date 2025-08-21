import React, {useState, useEffect} from 'react';
import {Text, useInput} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';

const BasicTextInput = ({onSubmit, onCancel}) => {
  const [value, setValue] = useState('');
  const {setMode} = useNavigation();

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
    <Text>
      {value}
      <Text inverse> </Text>
    </Text>
  );
};

export default BasicTextInput;
