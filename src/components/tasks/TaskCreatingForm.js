import React from 'react';
import {Text, Box} from 'ink';
import AutocompleteTextInput from '../AutocompleteTextInput.js';

const TaskCreatingForm = ({projectId, onSubmit, onCancel}) => {
  return (
    <Box flexDirection="column">
      <Text>New task title:</Text>
      <AutocompleteTextInput
        projectId={projectId}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </Box>
  );
};

export default TaskCreatingForm;
