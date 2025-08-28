import * as inquirer from '@inquirer/prompts';

import projectService from '../services/projectService.js';
import clientService from '../services/clientService.js';
import clientModel from '../models/client.js';
import {isProjectInvalid, isConfirmationInvalid} from '../../validation.js';

//TODO: validate

const createProject = async () => {
  if (!(await clientModel.isClient())) return;
  // Check client existance
  const clients = await clientService.selectAll();
  // project name create
  const name = await inquirer.input({
    message: 'What is the name of the project?',
    validate: input => {
      let resp;
      if ((resp = isProjectInvalid(input))) return resp;

      return true;
    },
  });

  const choices = clients
    .map(({name}) => ({name, value: name}))
    .concat({name: 'Stop', value: 'Stop'});

  const pName = await inquirer.search({
    message: 'To which client should I attach this?',
    source: input => {
      if (!input) return choices;
      return choices.filter(choice =>
        choice.name.toLowerCase().includes(input.toLowerCase()),
      );
    },
  });
  if (pName === 'Stop') return;

  const client = clients.find(c => c.name === pName);
  // save
  await projectService.create(name, client.id);
};

const selectAllProjects = async () => {
  const projects = await projectService.selectAll();
  return projects;
};

const editProject = async () => {
  const data = await projectService.selectAll();
  if (!data.length) return;

  const choices = data
    .map(({name}) => ({name, value: name}))
    .concat({name: 'Stop', value: 'Stop'});

  const name = await inquirer.search({
    message: 'Which one would you like to edit?',
    source: input => {
      if (!input) return choices;
      return choices.filter(choice =>
        choice.name.toLowerCase().includes(input.toLowerCase()),
      );
    },
  });

  if (name === 'Stop') return;

  const newName = await inquirer.input({
    default: name,
    message: 'New name?',
    validate: input => {
      if (input.toLowerCase() === 'exit') {
        console.log('Exiting the process...');
        process.exit(); // TODO: add prpper handling when user what to stop action, whole app
      }
      let resp;
      if ((resp = isProjectInvalid(input))) return resp;

      return true;
    },
  });

  const project = data.find(c => c.name === name);

  await projectService.update(project.id, newName);
};

const deleteProject = async () => {
  const data = await projectService.selectAll();
  if (!data.length) return;

  const choices = data
    .map(({name}) => ({name, value: name}))
    .concat({name: 'Stop', value: 'Stop'});

  const name = await inquirer.search({
    message: 'Which one would you like to delete?',
    source: input => {
      if (!input) return choices;
      return choices.filter(choice =>
        choice.name.toLowerCase().includes(input.toLowerCase()),
      );
    },
  });
  if (name === 'Stop') return;
  const confirmation = await inquirer.input({
    default: 'no',
    message: `Are you sure to delete project: ${name} ? (yes/no)`,
    validate: input => {
      if (input.toLowerCase() === 'exit') {
        console.log('Exiting the process...');
        process.exit(); // TODO: add prpper handling when user what to stop action, whole app
      }
      let resp;
      if ((resp = isConfirmationInvalid(input.toLowerCase()))) return resp;

      return true;
    },
  });

  if (
    confirmation.toLowerCase() === 'yes' ||
    confirmation.toLowerCase() === 'y'
  ) {
    const project = data.find(c => c.name === name);
    await projectService.delete(project);
  }
};

export {createProject, selectAllProjects, editProject, deleteProject};
