import 'dotenv/config';
import knex from 'knex';
import config from '../knexfile.js';

const env = process.env.ENV || 'development';

if (env === 'production') {
  console.error('ERROR: Cannot run seed in production environment!');
  process.exit(1);
}

const db = knex(config[env]);

const CLIENTS = [
  {name: 'Acme Corp', hourly_rate: 9000, currency: 'PLN'},
  {name: 'TechGiant', hourly_rate: 25000, currency: 'PLN'},
];

const PROJECTS = [
  {clientName: 'Acme Corp', name: 'Website Redesign'},
  {clientName: 'Acme Corp', name: 'Mobile App'},
  {clientName: 'TechGiant', name: 'Dashboard Analytics'},
];

const TASKS = [
  {projectName: 'Website Redesign', title: 'Homepage UI', estimated_minutes: 480},
  {projectName: 'Website Redesign', title: 'Contact Form', estimated_minutes: 120},
  {projectName: 'Website Redesign', title: 'Navigation Menu', estimated_minutes: 180},
  {projectName: 'Website Redesign', title: 'Footer Section', estimated_minutes: 90},
  {projectName: 'Mobile App', title: 'User Authentication', estimated_minutes: 360},
  {projectName: 'Mobile App', title: 'Push Notifications', estimated_minutes: 240},
  {projectName: 'Mobile App', title: 'Profile Settings', estimated_minutes: 150},
  {projectName: 'Mobile App', title: 'Data Sync', estimated_minutes: 300},
  {projectName: 'Dashboard Analytics', title: 'Data Visualization', estimated_minutes: 540},
  {projectName: 'Dashboard Analytics', title: 'Report Generation', estimated_minutes: 300},
  {projectName: 'Dashboard Analytics', title: 'Export Module', estimated_minutes: 180},
  {projectName: 'Dashboard Analytics', title: 'Filter System', estimated_minutes: 240},
];

const getWorkingDaysInJanuary2026 = () => {
  const days = [];
  for (let d = 2; d <= 30; d++) {
    const date = new Date(2026, 0, d);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) days.push(d);
  }
  return days;
};

const generateTimeEntries = (taskMap, workingDays) => {
  const entries = [];
  const taskIds = Object.keys(taskMap).map(Number);
  const entriesPerTask = {};

  taskIds.forEach(id => (entriesPerTask[id] = 0));

  for (const day of workingDays) {
    let currentHour = 8;

    while (currentHour < 18) {
      const underfilledTasks = taskIds.filter(id => entriesPerTask[id] < 20);
      const taskId =
        underfilledTasks.length > 0
          ? underfilledTasks[Math.floor(Math.random() * underfilledTasks.length)]
          : taskIds[Math.floor(Math.random() * taskIds.length)];

      const durationMinutes = 15 + Math.floor(Math.random() * 105);
      const startMinute = Math.floor(Math.random() * 30);

      const start = new Date(2026, 0, day, currentHour, startMinute);
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

      const isLastDayLastEntry = day === 30 && currentHour >= 16;

      entries.push({
        task_id: taskId,
        start: start.toISOString().slice(0, 19).replace('T', ' '),
        end: isLastDayLastEntry ? null : end.toISOString().slice(0, 19).replace('T', ' '),
      });

      entriesPerTask[taskId]++;
      currentHour = end.getHours() + 1;
    }
  }

  return entries;
};

const seed = async () => {
  console.log('Cleaning database...');

  await db('time_entry').del();
  await db('task').del();
  await db('synced_day').del();
  await db('client_rate_history').del();
  await db('project').del();
  await db('client').del();

  console.log('Inserting clients...');
  const clientIds = {};
  for (const client of CLIENTS) {
    const [id] = await db('client').insert(client);
    clientIds[client.name] = id;

    await db('client_rate_history').insert({
      client_id: id,
      hourly_rate: client.hourly_rate,
      currency: client.currency,
      effective_from: '2026-01-01',
    });
  }

  console.log('Inserting projects...');
  const projectIds = {};
  for (const project of PROJECTS) {
    const [id] = await db('project').insert({
      name: project.name,
      client_id: clientIds[project.clientName],
    });
    projectIds[project.name] = id;
  }

  console.log('Inserting tasks...');
  const taskMap = {};
  for (const task of TASKS) {
    const [id] = await db('task').insert({
      title: task.title,
      project_id: projectIds[task.projectName],
      estimated_minutes: task.estimated_minutes,
    });
    taskMap[id] = task;
  }

  console.log('Generating time entries...');
  const workingDays = getWorkingDaysInJanuary2026();
  const timeEntries = generateTimeEntries(taskMap, workingDays);

  console.log(`Inserting ${timeEntries.length} time entries...`);
  await db('time_entry').insert(timeEntries);

  console.log('Seed completed successfully!');
  console.log(`- Clients: ${CLIENTS.length}`);
  console.log(`- Projects: ${PROJECTS.length}`);
  console.log(`- Tasks: ${TASKS.length}`);
  console.log(`- Time entries: ${timeEntries.length}`);

  await db.destroy();
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
