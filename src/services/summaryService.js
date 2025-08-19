import task from '../models/task.js';
import {convToTss, formatNumbToHHMMss, mapToCamel} from '../utils.js';
import projectService from './projectService.js';

const summaryService = {
  summaryByTask: async date => {
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }
    let tasks = await task.listAllByDate(date);
    tasks = tasks.map(task => mapToCamel(task));

    const total = {start: 0, end: 0, time: 0};
    for (const task of tasks) {
      const {projectId} = task;
      const project = await projectService.getProjectById(projectId);
      task.projectName = project.name;

      task.start = task.start.toString().slice(0, 24);
      task.end = task.end.toString().slice(0, 24);
      task.time = convToTss(task.end) - convToTss(task.start);

      total.time += task.time;
      task.time = formatNumbToHHMMss(task.time);
      delete task.projectId;
      delete task.id;
    }
    total.time = formatNumbToHHMMss(total.time);

    return {tasks, total: total.time};
  },
};

export default summaryService;
