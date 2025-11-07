const up = knex => {
  return knex.schema.createTable('synced_day', table => {
    table.date('day').primary();
    table.boolean('synced').notNullable().defaultTo(false);
    table.timestamp('synced_at').nullable();
  });
};

const down = knex => {
  return knex.schema.dropTableIfExists('synced_day');
};

export {up, down};
