import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {useNavigation} from '../contexts/NavigationContext.js';

// Find next word start
const findNextWord = (value, cursor) => {
  let pos = cursor;
  // Skip current word (non-space chars)
  while (pos < value.length && value[pos] !== ' ' && value[pos] !== ':') pos++;
  // Skip spaces/separators
  while (pos < value.length && (value[pos] === ' ' || value[pos] === ':'))
    pos++;
  return Math.min(pos, Math.max(0, value.length - 1));
};

// Find previous word start
const findPrevWord = (value, cursor) => {
  let pos = cursor;
  // If at start of a word, go back one
  if (pos > 0 && (value[pos - 1] === ' ' || value[pos - 1] === ':')) pos--;
  // Skip spaces/separators going back
  while (pos > 0 && (value[pos - 1] === ' ' || value[pos - 1] === ':')) pos--;
  // Skip word chars going back to find start
  while (pos > 0 && value[pos - 1] !== ' ' && value[pos - 1] !== ':') pos--;
  return pos;
};

const VimTextInput = ({
  label = '',
  defaultValue = '',
  onSubmit,
  onCancel,
  placeholder = '',
  multiline = false,
}) => {
  const {setInputLocked} = useNavigation();
  const [value, setValue] = useState(defaultValue);
  const [cursor, setCursor] = useState(0);
  const [error, setError] = useState(null);
  const [vimMode, setVimMode] = useState('normal');
  const [command, setCommand] = useState('');
  const [selectStart, setSelectStart] = useState(0);

  useEffect(() => {
    setInputLocked(true);
    setValue(defaultValue);
    setCursor(0);

    return () => setInputLocked(false);
  }, []);

  const submit = () => {
    setInputLocked(false);
    onSubmit(value);
  };

  const cancel = () => {
    setInputLocked(false);
    onCancel();
  };

  const executeCommand = cmd => {
    const trimmed = cmd.trim().toLowerCase();
    if (trimmed === 'w' || trimmed === 'wq') {
      submit();
    } else if (trimmed === 'q' || trimmed === 'q!') {
      cancel();
    } else {
      setError(`Unknown command: ${cmd}`);
    }
    setCommand('');
    setVimMode('normal');
  };

  useInput((input, key) => {
    // Command mode
    if (vimMode === 'command') {
      if (key.return) {
        executeCommand(command);
        return;
      }
      if (key.escape) {
        setCommand('');
        setVimMode('normal');
        return;
      }
      if (key.backspace || key.delete) {
        if (command.length > 0) {
          setCommand(prev => prev.slice(0, -1));
        } else {
          setVimMode('normal');
        }
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        setCommand(prev => prev + input);
      }
      return;
    }

    // Normal mode
    if (vimMode === 'normal') {
      if (key.escape) {
        cancel();
        return;
      }

      // Enter command mode
      if (input === ':') {
        setVimMode('command');
        setCommand('');
        return;
      }

      // Navigation
      if (input === 'h' || key.leftArrow) {
        setCursor(prev => Math.max(0, prev - 1));
        return;
      }
      if (input === 'l' || key.rightArrow) {
        setCursor(prev => Math.min(Math.max(0, value.length - 1), prev + 1));
        return;
      }
      if (input === '0' || input === '^') {
        setCursor(0);
        return;
      }
      if (input === '$') {
        setCursor(Math.max(0, value.length - 1));
        return;
      }

      // Word navigation
      if (input === 'w') {
        setCursor(findNextWord(value, cursor));
        return;
      }
      if (input === 'b') {
        setCursor(findPrevWord(value, cursor));
        return;
      }

      // Delete character at cursor (x)
      if (input === 'x') {
        if (value.length > 0 && cursor < value.length) {
          setValue(prev => prev.slice(0, cursor) + prev.slice(cursor + 1));
          if (cursor >= value.length - 1 && cursor > 0) {
            setCursor(prev => prev - 1);
          }
          setError(null);
        }
        return;
      }

      // Backspace in normal mode - move left (like h)
      if (key.backspace || key.delete) {
        setCursor(prev => Math.max(0, prev - 1));
        return;
      }

      // Visual mode (v)
      if (input === 'v') {
        setSelectStart(cursor);
        setVimMode('visual');
        return;
      }

      // Replace mode (r)
      if (input === 'r') {
        setVimMode('replace');
        return;
      }

      // Enter insert mode
      if (input === 'i') {
        setVimMode('insert');
        return;
      }
      if (input === 'a') {
        setCursor(prev => Math.min(value.length, prev + 1));
        setVimMode('insert');
        return;
      }
      if (input === 'I') {
        setCursor(0);
        setVimMode('insert');
        return;
      }
      if (input === 'A') {
        setCursor(value.length);
        setVimMode('insert');
        return;
      }

      return;
    }

    // Insert mode
    if (vimMode === 'insert') {
      if (key.escape) {
        setVimMode('normal');
        setCursor(prev => Math.max(0, prev - 1));
        return;
      }

      if (key.return) {
        if (multiline) {
          setValue(prev => prev.slice(0, cursor) + '\n' + prev.slice(cursor));
          setCursor(prev => prev + 1);
        } else {
          submit();
        }
        return;
      }

      if (key.backspace || key.delete) {
        if (cursor > 0) {
          setValue(prev => prev.slice(0, cursor - 1) + prev.slice(cursor));
          setCursor(prev => prev - 1);
          setError(null);
        }
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        setValue(prev => prev.slice(0, cursor) + input + prev.slice(cursor));
        setCursor(prev => prev + 1);
        setError(null);
      }
      return;
    }

    // Replace mode
    if (vimMode === 'replace') {
      if (key.escape) {
        setVimMode('normal');
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        if (cursor < value.length) {
          setValue(
            prev => prev.slice(0, cursor) + input + prev.slice(cursor + 1),
          );
        } else {
          setValue(prev => prev + input);
        }
        setError(null);
        setVimMode('normal');
      }
      return;
    }

    // Visual mode
    if (vimMode === 'visual') {
      if (key.escape) {
        setVimMode('normal');
        return;
      }

      // Navigation extends selection
      if (input === 'h' || key.leftArrow) {
        setCursor(prev => Math.max(0, prev - 1));
        return;
      }
      if (input === 'l' || key.rightArrow) {
        setCursor(prev => Math.min(Math.max(0, value.length - 1), prev + 1));
        return;
      }
      if (input === 'w') {
        setCursor(findNextWord(value, cursor));
        return;
      }
      if (input === 'b') {
        setCursor(findPrevWord(value, cursor));
        return;
      }
      if (input === '0' || input === '^') {
        setCursor(0);
        return;
      }
      if (input === '$') {
        setCursor(Math.max(0, value.length - 1));
        return;
      }

      // Delete selection (x or d)
      if (input === 'x' || input === 'd') {
        const start = Math.min(selectStart, cursor);
        const end = Math.max(selectStart, cursor);
        setValue(prev => prev.slice(0, start) + prev.slice(end + 1));
        setCursor(start > 0 ? start : 0);
        setError(null);
        setVimMode('normal');
        return;
      }

      return;
    }
  });

  // Mode indicator
  const getModeDisplay = () => {
    switch (vimMode) {
      case 'normal':
        return {text: 'NORMAL', color: 'blue'};
      case 'insert':
        return {text: 'INSERT', color: 'green'};
      case 'replace':
        return {text: 'REPLACE', color: 'yellow'};
      case 'command':
        return {text: 'COMMAND', color: 'magenta'};
      case 'visual':
        return {text: 'VISUAL', color: 'cyan'};
      default:
        return {text: 'NORMAL', color: 'blue'};
    }
  };

  const modeInfo = getModeDisplay();

  // Render value with cursor or selection
  const renderValue = () => {
    const displayValue = value || placeholder;
    const isPlaceholder = !value && placeholder;

    if (vimMode === 'visual' && value) {
      const start = Math.min(selectStart, cursor);
      const end = Math.max(selectStart, cursor);
      const before = value.slice(0, start);
      const selected = value.slice(start, end + 1);
      const after = value.slice(end + 1);
      return (
        <>
          <Text>{before}</Text>
          <Text backgroundColor="cyan" color="black">
            {selected}
          </Text>
          <Text>{after}</Text>
        </>
      );
    }

    if (!value) {
      return (
        <>
          <Text inverse> </Text>
          {placeholder && <Text dimColor>{placeholder}</Text>}
        </>
      );
    }

    const beforeCursor = displayValue.slice(0, cursor);
    const atCursor = displayValue[cursor] || ' ';
    const afterCursor = displayValue.slice(cursor + 1);
    return (
      <>
        <Text dimColor={isPlaceholder}>{beforeCursor}</Text>
        <Text inverse dimColor={isPlaceholder}>
          {atCursor}
        </Text>
        <Text dimColor={isPlaceholder}>{afterCursor}</Text>
      </>
    );
  };

  return (
    <Box flexDirection="column">
      {label && (
        <Box>
          <Text color="cyan" bold>
            {label}
          </Text>
          <Text> </Text>
          <Text color={modeInfo.color} bold>
            [{modeInfo.text}]
          </Text>
        </Box>
      )}
      {!label && (
        <Box>
          <Text color={modeInfo.color} bold>
            [{modeInfo.text}]
          </Text>
        </Box>
      )}
      <Box marginTop={1}>{renderValue()}</Box>
      {vimMode === 'command' && (
        <Box marginTop={1}>
          <Text>:</Text>
          <Text>{command}</Text>
          <Text inverse> </Text>
        </Box>
      )}
      {error && (
        <Text color="red" marginTop={1}>
          {error}
        </Text>
      )}
      <Text dimColor marginTop={1}>
        {vimMode === 'normal' &&
          'h/l:move w/b:word i/a:insert x:del v:select r:replace :w :q'}
        {vimMode === 'insert' && 'Type to edit | Esc:normal'}
        {vimMode === 'replace' && 'Type replacement char'}
        {vimMode === 'command' && 'Enter:execute Esc:cancel'}
        {vimMode === 'visual' && 'h/l/w/b:extend x/d:delete Esc:cancel'}
      </Text>
    </Box>
  );
};

export default VimTextInput;
