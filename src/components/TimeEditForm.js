import React from 'react';
import {format, getYear, getMonth, getDate} from 'date-fns';
import {TZDate} from '@date-fns/tz';
import {getTimezone} from '../utils.js';
import VimTextInput from './VimTextInput.js';

const parseTimeInput = input => {
  const match = input.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;
  if (seconds < 0 || seconds > 59) return null;

  return {hours, minutes, seconds};
};

const TimeEditForm = ({label, currentTime, onSubmit, onCancel}) => {
  const defaultValue = format(currentTime, 'HH:mm:ss');

  const handleSubmit = value => {
    const parsed = parseTimeInput(value);
    if (!parsed) {
      // If invalid, just cancel - user can try again
      onCancel();
      return;
    }

    const year = getYear(currentTime);
    const month = getMonth(currentTime);
    const day = getDate(currentTime);
    const tz = getTimezone();

    const newTime = new TZDate(
      year,
      month,
      day,
      parsed.hours,
      parsed.minutes,
      parsed.seconds,
      tz,
    );

    onSubmit(newTime);
  };

  return (
    <VimTextInput
      label={label}
      defaultValue={defaultValue}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      placeholder="HH:mm:ss"
    />
  );
};

export default TimeEditForm;
