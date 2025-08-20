import * as inquirer from '@inquirer/prompts';

import summaryService from '../services/summaryService.js';

const buildDateChoices = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push({
      name: date.toISOString().split('T')[0],
      value: date.toISOString().split('T')[0],
    });
  }

  return dates;
};

const summary = async () => {
  const choices = buildDateChoices();
  const date = await inquirer.select({
    message: 'Select date for summary',
    choices,
  });

  await summaryService.summaryByTask(date);
};

export {summary};
