const up = async knex => {
  // Step 1: Create new task_definition table for task definitions
  await knex.schema.createTable('task_definition', table => {
    table.increments('id').unsigned().primary();
    table.string('title', 100).notNullable();
    table.integer('project_id').unsigned().notNullable();
    table.decimal('estimated_hours', 5, 2).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.foreign('project_id').references('id').inTable('project');
    table.unique(['title', 'project_id']);
    table.index(['project_id'], 'idx_task_def_project');
  });

  // Step 2: Add task_id column to existing task table (will become time_entry)
  await knex.schema.alterTable('task', table => {
    table.integer('task_id').unsigned().nullable();
  });

  // Step 3: Migrate data - create task definitions from distinct title+project combinations
  const distinctTasks = await knex('task')
    .distinct('title', 'project_id')
    .whereNotNull('project_id');

  for (const entry of distinctTasks) {
    const [taskDefId] = await knex('task_definition').insert({
      title: entry.title,
      project_id: entry.project_id,
    });

    // Update existing task entries to reference the new task definition
    await knex('task')
      .where('title', entry.title)
      .andWhere('project_id', entry.project_id)
      .update({task_id: taskDefId});
  }

  // Step 4: Handle any orphaned entries (null project_id) - delete them
  await knex('task').whereNull('project_id').del();

  // Step 5: Add foreign key constraint and make task_id NOT NULL
  await knex.schema.alterTable('task', table => {
    table.foreign('task_id').references('id').inTable('task_definition');
  });

  // Make task_id NOT NULL after data migration
  await knex.raw('ALTER TABLE task MODIFY task_id INT UNSIGNED NOT NULL');

  // Step 6: Drop old columns from task table
  await knex.schema.alterTable('task', table => {
    table.dropIndex('title', 'idx_task_title');
    table.dropForeign(['project_id']);
    table.dropColumn('title');
    table.dropColumn('project_id');
  });

  // Step 7: Rename tables
  await knex.schema.renameTable('task', 'time_entry');
  await knex.schema.renameTable('task_definition', 'task');

  // Step 8: Add index on time_entry
  await knex.schema.alterTable('time_entry', table => {
    table.index(['task_id'], 'idx_time_entry_task');
    table.index(['start'], 'idx_time_entry_start');
  });
};

const down = async knex => {
  // Reverse the migration
  await knex.schema.renameTable('task', 'task_definition');
  await knex.schema.renameTable('time_entry', 'task');

  // Add back title and project_id columns
  await knex.schema.alterTable('task', table => {
    table.dropIndex(['task_id'], 'idx_time_entry_task');
    table.dropIndex(['start'], 'idx_time_entry_start');
    table.string('title', 100);
    table.integer('project_id').unsigned();
  });

  // Restore data from task_definition
  const timeEntries = await knex('task')
    .join('task_definition', 'task.task_id', 'task_definition.id')
    .select('task.id', 'task_definition.title', 'task_definition.project_id');

  for (const entry of timeEntries) {
    await knex('task')
      .where('id', entry.id)
      .update({title: entry.title, project_id: entry.project_id});
  }

  // Restore foreign key and index
  await knex.schema.alterTable('task', table => {
    table.foreign('project_id').references('id').inTable('project');
    table.index('title', 'idx_task_title');
    table.dropForeign(['task_id']);
    table.dropColumn('task_id');
  });

  // Drop task_definition table
  await knex.schema.dropTableIfExists('task_definition');
};

export {up, down};
