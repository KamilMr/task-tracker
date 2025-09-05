import taskModel from '../models/task.js';
import projectModel from '../models/project.js';
import {getFormatedDate, retriveYYYYMMDD} from '../utils.js';

const taskService = {
  create: async ({start, end, title, projectId}) => {
    const project = await projectModel.selectProject(projectId);
    if (!project) throw 'Project does not exist';

    const existingTask = await taskModel.findByNameAndProject(title, projectId);
    if (existingTask) {
      throw new Error(`Task "${title}" already exists in this project`);
    }

    return taskModel.create({start, end, title, projectId});
  },

  startTask: async ({title, projectId, start = getFormatedDate()}) => {
    const project = await projectModel.selectProject(projectId);
    if (!project) throw 'Project does not exist';

    const activeTask = await taskModel.selectActiveTask();
    if (activeTask) {
      await taskModel.edit({id: activeTask.id, end: getFormatedDate()});
    }

    const id = await taskModel.create({title, projectId, start});

    return id[0];
  },

  toggleTask: async ({title, projectId, start = getFormatedDate()}) => {
    const project = await projectModel.selectProject(projectId);
    if (!project) throw 'Project does not exist';

    const activeTask = await taskModel.selectActiveTask();

    if (!activeTask) {
      // No active task, start the requested task
      const id = await taskModel.create({title, projectId, start});
      return {action: 'started', id: id[0]};
    }

    // Check if the requested task matches the active task
    const isSameTask =
      activeTask.title === title && activeTask.project_id === projectId;

    if (isSameTask) {
      // Same task is active, stop it
      await taskModel.edit({id: activeTask.id, end: getFormatedDate()});
      return {action: 'stopped', id: activeTask.id};
    } else {
      // Different task requested, stop current and start new one
      await taskModel.edit({id: activeTask.id, end: getFormatedDate()});
      const id = await taskModel.create({title, projectId, start});
      return {action: 'switched', stoppedId: activeTask.id, startedId: id[0]};
    }
  },

  selectActiveTask: () => {
    return taskModel.selectActiveTask();
  },

  endTask: async ({id, end = getFormatedDate()}) => {
    const activeTask = await taskModel.selectActiveTask();
    if (!activeTask) throw new Error('No active task found');

    if (activeTask.id !== id)
      throw new Error('Provided task ID does not match the active task');

    return taskModel.edit({id, end});
  },

  selectAll: () => {
    return taskModel.listAll();
  },

  selectById: id => {
    return taskModel.selectById(id);
  },

  selectByProjectId: projectId => {
    return taskModel.selectByProjectId(projectId);
  },

  update: async (oldTitle, title, pId) => {
    const existingTasks = await taskModel.findAllByNameAndProject(
      oldTitle,
      pId,
    );

    if (!existingTasks.length)
      throw new Error(
        `No tasks found with title "${oldTitle}" in this project`,
      );

    const updatePromises = existingTasks.map(task =>
      taskModel.edit({id: task.id, title}),
    );

    return Promise.all(updatePromises);
  },

  delete: id => {
    return taskModel.delete({col: 'id', val: id});
  },

  deleteAllByTitle: async (title, projectId) => {
    const existingTasks = await taskModel.findAllByNameAndProject(
      title,
      projectId,
    );

    if (!existingTasks.length) {
      throw new Error(`No tasks found with title "${title}" in this project`);
    }

    return taskModel.deleteAllByTitle(title, projectId);
  },

  deleteByProject: id => {
    return taskModel.delete({col: 'project_id', val: id});
  },

  getTodayHours: async (projectId = null) => {
    const tasks = await taskModel.getTodayHours(projectId);
    return taskService.calculateTimeSpend(tasks);
  },

  getTasksByProjectAndDate: async (projectId, date = null) => {
    const targetDate = date || retriveYYYYMMDD();
    const tasks = await taskModel.listAllByDate(targetDate);
    return tasks.filter(task => task.project_id === projectId);
  },

  calculateTimeSpend: (tasks, isT1 = false) => {
    let totalSeconds = 0;

    tasks.forEach(task => {
      if (task.start && task.end) {
        const startTime = new Date(task.start).getTime();
        const endTime = new Date(task.end).getTime();
        totalSeconds += Math.floor((endTime - startTime) / 1000);
      }
    });

    let hours = Math.floor(totalSeconds / 3600);

    // Dev testing
    if (isT1) {
      try {
        const {t1} = require('../utils/t1.js');
        hours = t1(hours, isT1);
        totalSeconds = hours * 3600 + (totalSeconds % 3600);
      } catch (e) {}
    }

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return {hours, minutes, totalSeconds};
  },

  getAllTasksFromToday: async (date = new Date(), pId = null) => {
    const filteredTasks = await taskService.getTasksByProjectAndDate(pId, date);
    const activeTask = await taskService.getActiveTask();
    filteredTasks.push(activeTask);

    // Group tasks by title and project_id
    const groupedTasks = filteredTasks.reduce((acc, task) => {
      const key = `${task.title}_${task.project_id}`;

      if (!acc[key]) {
        acc[key] = {
          id: task.id,
          title: task.title,
          projectId: task.project_id,
          totalSec: 0,
          segments: [],
        };
      }

      const startTime = new Date(task.start);
      const endTime = task.end ? new Date(task.end) : null;
      const durationTime = endTime
        ? Math.floor((endTime - startTime) / 1000)
        : 0;
      acc[key].totalSec += durationTime;

      if (!task.end) acc[key].isActive = true;

      acc[key].segments.push({
        id: task.id,
        startTime: task.start,
        endTime: task.end,
        durationTime,
      });

      return acc;
    }, {});

    return Object.values(groupedTasks);
  },

  getActiveTask: () => {
    return taskModel.selectActiveTask();
  },
};

export default taskService;
