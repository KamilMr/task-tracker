const up = knex =>
  knex.schema.alterTable('client', table => {
    table.integer('monthly_hours').unsigned().nullable();
    table.decimal('daily_hours', 4, 1).nullable();
  });

const down = knex =>
  knex.schema.alterTable('client', table => {
    table.dropColumn('monthly_hours');
    table.dropColumn('daily_hours');
  });

export {up, down};
