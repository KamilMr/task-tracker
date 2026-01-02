const up = async knex => {
  await knex.schema.alterTable('task', table => {
    table.integer('estimated_minutes').unsigned().nullable();
  });

  await knex.schema.alterTable('task', table => {
    table.dropColumn('estimated_hours');
  });
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
