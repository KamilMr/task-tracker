#!/usr/bin/env node

import {program} from 'commander';
import {search} from '@inquirer/prompts';

import {
  createClient,
  deleteClient,
  editClient,
  selectAllClients,
} from './commands/client.js';
import {
  createProject,
  deleteProject,
  editProject,
  selectAllProjects,
} from './commands/project.js';
import {
  createTask,
  deleteTask,
  editTask,
  selectAllTasks,
  timer,
} from './commands/task.js';
import {summary} from './commands/summary.js';
import {clearTerminal} from './utils.js';

program.version('1.0.0');

const mappedActions = {
  'Start timer': timer,
  'Summary selected date': summary,
  'Add client': createClient,
  'Add project': createProject,
  'Add task': createTask,
  'Delete client': deleteClient, // TODO:add prop handling
  'Delete project': deleteProject,
  'Delete tasks': deleteTask,
  'Edit client': editClient,
  'Edit project': editProject,
  'Edit task': editTask,
  'Show clients': selectAllClients,
  'Show projects': selectAllProjects,
  'Show tasks': selectAllTasks,
  Exit: () => {
    process.exit();
  },
};

const main = async () => {
  clearTerminal();
  try {
    while (true) {
      const action = await search({
        message: 'What you want to do?',
        source: input => {
          const choices = Object.keys(mappedActions).map(f => ({
            name: f,
            value: f,
          }));
          if (!input) return choices;
          return choices.filter(choice =>
            choice.name.toLowerCase().includes(input.toLowerCase()),
          );
        },
      });
      console.log(action);
      const func = mappedActions[action];
      if (!func) throw new Error('Action not recognized');

      console.log(`Executing ${func.name}...`);
      await func();
      // process.exit();
    }
  } catch (err) {
    console.error('An error occurred:', err);
  }
};

main(program.parse(process.argv));
