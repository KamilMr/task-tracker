import projectModel from '../models/project.js';
import taskService from './taskService.js';
import {mapToCamel} from '../utils.js';

const projectService = {
  create: (name, clientId) => {
    if (!name || name.trim().length === 0)
      throw new Error('Project name cannot be empty');
    if (name.length > 50)
      throw new Error('Project name cannot exceed 50 characters');

    return projectModel.create(name, clientId);
  },

  selectAll: () => {
    return projectModel.listAll();
  },

  selectByCliId: id => {
    return projectModel.selectByCliId(id);
  },

  delete: async project => {
    await taskService.deleteByProject(project.id);
    return projectModel.delete(project.id);
  },

  update: (id, name) => {
    if (!name || name.trim().length === 0)
      throw new Error('Project name cannot be empty');
    if (name.length > 50)
      throw new Error('Project name cannot exceed 50 characters');

    return projectModel.edit(id, name);
  },
  getProjectById: async id => {
    const tR = await projectModel.selectProject(id);
    if (!tR || !tR[0]) return null;
    return mapToCamel(tR[0]);
  },
};

export default projectService;
