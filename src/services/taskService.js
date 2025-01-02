import taskModel from '../models/task.js';
import projectModel from '../models/project.js';
import {convToSnake} from '../utils.js';

const taskService = {
  create: async ({start, end, title, projectId}) => {
    // TODO: consider importance of this
    const project = await projectModel.selectProject(projectId);
    if (!project) throw 'Project does not exist';

    return taskModel.create({start, end, title, projectId});
  },

  selectAll: () => {
    return taskModel.listAll();
  },

  selectById: id => {
    return taskModel.selectById(id);
  },

  update: async data => {
    const project = await projectModel.selectProject(data.projectId);
    if (!project) throw 'Project does not exist';
    return taskModel.edit(convToSnake(data));
  },

  delete: id => {
    return taskModel.delete({col: 'id', val: id});
  },

  deleteByProject: id => {
    return taskModel.delete({col: 'project_id', val: id});
  },
};

export default taskService;
