import React from 'react';
import VimTextInput from '../VimTextInput.js';

const TaskCreatingForm = ({onSubmit, onCancel}) => {
  return (
    <VimTextInput
      label="New task title"
      defaultValue=""
      onSubmit={onSubmit}
      onCancel={onCancel}
      placeholder="Enter task name..."
    />
  );
};

export default TaskCreatingForm;
