import projectModel from '../models/project.js';
import task from '../models/task.js';

const projectService = {
  create: (name, clientId) => {
    return projectModel.create(name, clientId);
  },

  selectAll: () => {
    return projectModel.listAll();
  },

  selectByCliId: id => {
    return projectModel.selectByCliId(id);
  },

  delete: async project => {
    await task.delete({col: 'project_id', val: project.id});
    return projectModel.delete({col: 'id', value: project.id});
  },

  update: (id, name) => {
    return projectModel.edit(id, name);
  },
};

export default projectService;
