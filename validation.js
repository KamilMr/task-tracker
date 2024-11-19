import {string} from 'yup';

const REGEX_DATE_HOUR = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

const isInvalidYup = (schema, ...rest) => {
  try {
    schema.validateSync(...rest);
  } catch (err) {
    // console.log(err)// TODO: handle console.logs in production properly
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

const projectSchema = string().min(2).max(24).required();

const clientSchema = string().min(2).max(24).required();

const confirmationSchema = string().min(1).max(3).oneOf(['yes','no','y','n']).required();

export const isTaskInvalid = d => isInvalidYup(taskSchema, d);
export const isDateInvalid = d => isInvalidYup(dateSchema, d);
export const isProjectInvalid = d => isInvalidYup(projectSchema, d);
export const isClientInvalid = d => isInvalidYup(clientSchema, d);
export const isConfirmationInvalid = d => isInvalidYup(confirmationSchema, d);