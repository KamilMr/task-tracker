import React from 'react';
import VimTextInput from '../VimTextInput.js';

const TaskEditingForm = ({defaultValue, onSubmit, onCancel}) => {
  return (
    <VimTextInput
      label="Edit task title"
      defaultValue={defaultValue || ''}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
};

export default TaskEditingForm;
