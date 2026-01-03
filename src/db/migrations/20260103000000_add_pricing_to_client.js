const up = knex =>
  knex.schema.alterTable('client', table => {
    table.integer('hourly_rate').unsigned().nullable();
    table.string('currency', 3).notNullable().defaultTo('PLN');
  });

const down = knex =>
  knex.schema.alterTable('client', table => {
    table.dropColumn('hourly_rate');
    table.dropColumn('currency');
  });

export {up, down};
