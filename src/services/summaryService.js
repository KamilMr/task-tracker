import task from '../models/task.js';
import {formatNumbToHHMMss, mapToCamel} from '../utils.js';
import projectService from './projectService.js';

const summaryService = {
  summaryByTask: async () => {
    let tasks = await task.listAll();
    tasks = tasks.map(task => mapToCamel(task));

    const total = {start: 0, end: 0, time: 0};
    for (const task of tasks) {
      const {projectId} = task;
      const project = await projectService.getProjectById(projectId);
      task.projectName = project.name;

      task.start = task.start.toString().slice(0, 24);
      task.end = task.end.toString().slice(0, 24);

      total.time += task.time;
      task.time = formatNumbToHHMMss(task.time);
      delete task.projectId;
      delete task.id;
    }
    total.time = formatNumbToHHMMss(total.time);

    tasks.push(total);
    console.table(tasks);
  },
};

export default summaryService;
