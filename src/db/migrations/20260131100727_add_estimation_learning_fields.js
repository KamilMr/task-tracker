const up = async knex => {
  await knex.schema.alterTable('task', table => {
    table.string('epic', 100).nullable();
    table
      .enum('category', [
        'integration',
        'feature',
        'ui',
        'fix',
        'refactor',
        'config',
      ])
      .nullable();
    table.boolean('is_exploration').defaultTo(false);
    table.enum('scope', ['small', 'medium', 'large']).nullable();

    table.index(['epic'], 'idx_task_epic');
    table.index(['category'], 'idx_task_category');
  });
};

const down = async knex => {
  await knex.schema.alterTable('task', table => {
    table.dropIndex(['epic'], 'idx_task_epic');
    table.dropIndex(['category'], 'idx_task_category');
    table.dropColumn('epic');
    table.dropColumn('category');
    table.dropColumn('is_exploration');
    table.dropColumn('scope');
  });
};

export {up, down};
