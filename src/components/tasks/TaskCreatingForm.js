import React from 'react';
import {Text, Box} from 'ink';
import BasicTextInput from '../BasicTextInput.js';

const TaskCreatingForm = ({onSubmit, onCancel}) => {
  return (
    <Box flexDirection="column">
      <Text>New task title:</Text>
      <BasicTextInput onSubmit={onSubmit} onCancel={onCancel} />
    </Box>
  );
};

export default TaskCreatingForm;