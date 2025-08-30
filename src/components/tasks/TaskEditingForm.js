import React from 'react';
import {Text, Box} from 'ink';
import BasicTextInput from '../BasicTextInput.js';

const TaskEditingForm = ({defaultValue, onSubmit, onCancel}) => {
  return (
    <Box flexDirection="column">
      <Text>Edit task title:</Text>
      <BasicTextInput
        defaultValue={defaultValue || ''}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </Box>
  );
};

export default TaskEditingForm;
