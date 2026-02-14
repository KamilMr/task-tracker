import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';

const EditForm = ({title, fields, onSubmit, onCancel}) => {
  const [currentField, setCurrentField] = useState(0);
  const [values, setValues] = useState(() =>
    fields.reduce((acc, f) => ({...acc, [f.name]: f.defaultValue ?? ''}), {}),
  );
  const [textInputs, setTextInputs] = useState(() =>
    fields.reduce(
      (acc, f) => ({...acc, [f.name]: String(f.defaultValue ?? '')}),
      {},
    ),
  );
  const {setMode} = useNavigation();

  useEffect(() => {
    setMode('insert');
  }, [setMode]);

  const handleSubmitAll = () => {
    const result = {};
    for (const f of fields) {
      result[f.name] = textInputs[f.name];
    }
    onSubmit(result);
    setMode('normal');
  };

  const currentName = fields[currentField].name;

  const nextField = () => {
    // Save current text input into values
    setValues(v => ({...v, [currentName]: textInputs[currentName]}));
    if (currentField < fields.length - 1) setCurrentField(currentField + 1);
    else handleSubmitAll();
  };

  const prevField = () => {
    setValues(v => ({...v, [currentName]: textInputs[currentName]}));
    if (currentField > 0) setCurrentField(currentField - 1);
  };

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      setMode('normal');
      return;
    }

    if (key.tab) {
      if (key.shift) prevField();
      else nextField();
      return;
    }

    if (key.return) {
      nextField();
      return;
    }

    if (key.backspace || key.delete) {
      setTextInputs(prev => ({
        ...prev,
        [currentName]: prev[currentName].slice(0, -1),
      }));
      return;
    }

    if (input && !key.ctrl && !key.meta)
      setTextInputs(prev => ({
        ...prev,
        [currentName]: prev[currentName] + input,
      }));
  });

  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      <Text dimColor>Tab: next | Shift+Tab: prev | Esc: cancel | Enter: confirm</Text>
      <Text> </Text>
      {fields.map((f, i) => {
        const isActive = i === currentField;
        const displayValue = textInputs[f.name];

        return (
          <Box key={f.name}>
            <Text color={isActive ? 'green' : 'white'}>
              {isActive ? '▸ ' : '  '}
              {f.label}:{' '}
            </Text>
            {isActive ? (
              <Text>
                {displayValue}
                <Text inverse> </Text>
              </Text>
            ) : (
              <Text dimColor={!displayValue}>
                {displayValue || '(empty)'}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default EditForm;
