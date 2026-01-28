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
    const project = await projectModel.selectById(id);
    if (!project) return null;
    return mapToCamel(project);
  },
};

export default projectService;
