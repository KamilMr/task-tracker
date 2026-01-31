import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {useNavigation} from '../../contexts/NavigationContext.js';

const CATEGORIES = [
  'integration',
  'feature',
  'ui',
  'fix',
  'refactor',
  'config',
];
const CATEGORY_SHORTCUTS = {
  i: 'integration',
  f: 'feature',
  u: 'ui',
  x: 'fix',
  r: 'refactor',
  c: 'config',
};
const SCOPES = ['small', 'medium', 'large'];
const SCOPE_SHORTCUTS = {s: 'small', m: 'medium', l: 'large'};

const FIELDS = ['epic', 'category', 'exploration', 'scope'];

const MetadataEditingForm = ({
  taskTitle,
  defaultValues = {},
  onSubmit,
  onCancel,
}) => {
  const [currentField, setCurrentField] = useState(0);
  const [values, setValues] = useState({
    epic: defaultValues.epic || '',
    category: defaultValues.category || '',
    isExploration: defaultValues.isExploration || false,
    scope: defaultValues.scope || '',
  });
  const [textInput, setTextInput] = useState(defaultValues.epic || '');
  const {setMode} = useNavigation();

  useEffect(() => {
    setMode('insert');
  }, [setMode]);

  const handleSubmitAll = () => {
    onSubmit({
      epic: values.epic || null,
      category: values.category || null,
      isExploration: values.isExploration,
      scope: values.scope || null,
    });
    setMode('normal');
  };

  const nextField = () => {
    if (currentField < FIELDS.length - 1) {
      setCurrentField(currentField + 1);
      if (FIELDS[currentField + 1] === 'category')
        setTextInput(values.category);
      else if (FIELDS[currentField + 1] === 'scope') setTextInput(values.scope);
    } else {
      handleSubmitAll();
    }
  };

  const prevField = () => {
    if (currentField > 0) {
      setCurrentField(currentField - 1);
      if (FIELDS[currentField - 1] === 'epic') setTextInput(values.epic);
    }
  };

  useInput((input, key) => {
    const field = FIELDS[currentField];

    if (key.escape) {
      onCancel();
      setMode('normal');
      return;
    }

    // Tab to next field, Shift+Tab to previous
    if (key.tab) {
      if (field === 'epic') setValues(v => ({...v, epic: textInput}));
      if (key.shift) prevField();
      else nextField();
      return;
    }

    // Handle each field type
    if (field === 'epic') {
      if (key.return) {
        setValues(v => ({...v, epic: textInput}));
        nextField();
        return;
      }
      if (key.backspace || key.delete) {
        setTextInput(prev => prev.slice(0, -1));
        return;
      }
      if (input && !key.ctrl && !key.meta) setTextInput(prev => prev + input);
    }

    if (field === 'category') {
      if (key.return) {
        nextField();
        return;
      }
      const shortcut = CATEGORY_SHORTCUTS[input?.toLowerCase()];
      if (shortcut) {
        setValues(v => ({
          ...v,
          category: v.category === shortcut ? '' : shortcut,
        }));
        return;
      }
      // Allow clearing with backspace
      if (key.backspace || key.delete) {
        setValues(v => ({...v, category: ''}));
      }
    }

    if (field === 'exploration') {
      if (key.return) {
        nextField();
        return;
      }
      if (input === 'y' || input === 'Y' || input === ' ') {
        setValues(v => ({...v, isExploration: !v.isExploration}));
      }
      if (input === 'n' || input === 'N') {
        setValues(v => ({...v, isExploration: false}));
      }
    }

    if (field === 'scope') {
      if (key.return) {
        handleSubmitAll();
        return;
      }
      const shortcut = SCOPE_SHORTCUTS[input?.toLowerCase()];
      if (shortcut) {
        setValues(v => ({...v, scope: v.scope === shortcut ? '' : shortcut}));
        return;
      }
      if (key.backspace || key.delete) {
        setValues(v => ({...v, scope: ''}));
      }
    }
  });

  const field = FIELDS[currentField];

  return (
    <Box flexDirection="column">
      <Text bold>Edit metadata for: {taskTitle}</Text>
      <Text dimColor>Tab: next field | Esc: cancel | Enter: confirm</Text>
      <Text> </Text>

      {/* Epic field */}
      <Box>
        <Text color={field === 'epic' ? 'green' : 'white'}>
          {field === 'epic' ? '▸ ' : '  '}Epic:{' '}
        </Text>
        {field === 'epic' ? (
          <Text>
            {textInput}
            <Text inverse> </Text>
          </Text>
        ) : (
          <Text dimColor={!values.epic}>{values.epic || '(empty)'}</Text>
        )}
      </Box>

      {/* Category field */}
      <Box>
        <Text color={field === 'category' ? 'green' : 'white'}>
          {field === 'category' ? '▸ ' : '  '}Category:{' '}
        </Text>
        {field === 'category' ? (
          <Text>
            {CATEGORIES.map(cat => (
              <Text
                key={cat}
                color={values.category === cat ? 'green' : undefined}
                inverse={values.category === cat}
              >
                {' '}
                [{CATEGORY_SHORTCUTS[cat[0]] === cat ? cat[0] : cat[0]}]
                {cat.slice(1)}{' '}
              </Text>
            ))}
          </Text>
        ) : (
          <Text dimColor={!values.category}>{values.category || '(none)'}</Text>
        )}
      </Box>

      {/* Exploration field */}
      <Box>
        <Text color={field === 'exploration' ? 'green' : 'white'}>
          {field === 'exploration' ? '▸ ' : '  '}Exploration:{' '}
        </Text>
        {field === 'exploration' ? (
          <Text>
            <Text
              color={values.isExploration ? 'green' : undefined}
              inverse={values.isExploration}
            >
              {' '}
              [y]es{' '}
            </Text>
            <Text
              color={!values.isExploration ? 'green' : undefined}
              inverse={!values.isExploration}
            >
              {' '}
              [n]o{' '}
            </Text>
          </Text>
        ) : (
          <Text dimColor>{values.isExploration ? 'yes' : 'no'}</Text>
        )}
      </Box>

      {/* Scope field */}
      <Box>
        <Text color={field === 'scope' ? 'green' : 'white'}>
          {field === 'scope' ? '▸ ' : '  '}Scope:{' '}
        </Text>
        {field === 'scope' ? (
          <Text>
            {SCOPES.map(s => (
              <Text
                key={s}
                color={values.scope === s ? 'green' : undefined}
                inverse={values.scope === s}
              >
                {' '}
                [{s[0]}]{s.slice(1)}{' '}
              </Text>
            ))}
          </Text>
        ) : (
          <Text dimColor={!values.scope}>{values.scope || '(none)'}</Text>
        )}
      </Box>
    </Box>
  );
};

export default MetadataEditingForm;
