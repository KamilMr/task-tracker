import createTogglSync from './index.js';
import dotenv from 'dotenv';

dotenv.config();

const date = process.argv[2];

const main = async () => {
  const togglSync = createTogglSync(
    process.env.TOGGL_API_TOKEN,
    process.env.TOGGL_WORKSPACE_ID
  );

  // Example 1: Sync today's tasks
  console.log('Syncing today\'s tasks...');
  const today = date ? new Date(date) : new Date();
  const results = await togglSync.syncTasksByDate(today);

  console.log(`Synced ${results.length} tasks`);

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Successful: ${successful}, Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed tasks:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- ${r.task.title}: ${r.error}`);
    });
  }

  // Example 2: Sync specific date
  // const specificDate = '2025-10-01';
  // const results = await togglSync.syncTasksByDate(specificDate);

  // Example 3: Sync by project
  // const projectId = 1;
  // const results = await togglSync.syncTasksByProject(projectId, today);

  // Example 4: Get Toggl projects
  // const projects = await togglSync.getTogglProjects();
  // console.log('Toggl Projects:', projects);

  // Example 5: With project mapping
  // const projectMapping = {
  //   1: 123456789,  // Local project 1 -> Toggl project 123456789
  //   2: 987654321,  // Local project 2 -> Toggl project 987654321
  // };
  // togglSync.setProjectMapping(projectMapping);
};

main().catch(console.error);
