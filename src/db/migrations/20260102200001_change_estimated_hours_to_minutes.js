const up = async knex => {
  const hasEstimatedHours = await knex.schema.hasColumn('task', 'estimated_hours');

  await knex.schema.alterTable('task', table => {
    table.integer('estimated_minutes').unsigned().nullable();
  });

  if (hasEstimatedHours) {
    await knex.schema.alterTable('task', table => {
      table.dropColumn('estimated_hours');
    });
  }
};

const down = async knex => {
  await knex.schema.alterTable('task', table => {
    table.decimal('estimated_hours', 5, 2).nullable();
  });

  await knex.schema.alterTable('task', table => {
    table.dropColumn('estimated_minutes');
  });
};

export {up, down};
