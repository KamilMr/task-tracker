import {string} from 'yup';

const REGEX_DATE_HOUR = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

const isInvalidYup = (schema, ...rest) => {
  try {
    schema.validateSync(...rest);
  } catch (err) {
    return err;
  }
};

const dateSchema = string()
  .matches(REGEX_DATE_HOUR)
  .test(
    'is-date-valid',
    ({value}) => `${value} is_not_valid`,
    d => {
      if (isNaN(new Date(d))) return false;

      return true;
    },
  )
  .required();

const taskSchema = string().min(2).max(50).required();

export const isTaskInvalid = d => isInvalidYup(taskSchema, d);
export const isDateInvalid = d => isInvalidYup(dateSchema, d);