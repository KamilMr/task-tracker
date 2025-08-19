import taskModel from '../models/task.js';
import projectModel from '../models/project.js';
import {convToSnake, getFormatedDate} from '../utils.js';

const taskService = {
  create: async ({start, end, title, projectId}) => {
    // TODO: consider importance of this
    const project = await projectModel.selectProject(projectId);
    if (!project) throw 'Project does not exist';

    return taskModel.create({start, end, title, projectId});
  },

  startTask: async ({title, projectId, start = getFormatedDate()}) => {
    const project = await projectModel.selectProject(projectId);
    if (!project) throw 'Project does not exist';

    const id = await taskModel.create({title, projectId, start});

    return id[0];
  },

  selectActiveTask: () => {
    return taskModel.selectActiveTask();
  },

  endTask: async ({id, end = getFormatedDate()}) => {
    return taskModel.edit({id, end});
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
