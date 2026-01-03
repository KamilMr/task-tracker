const up = async knex => {
  // Update existing NULL client_id values
  await knex('synced_day').whereNull('client_id').update({client_id: 5});

  await knex.schema.alterTable('synced_day', table => {
    table.integer('client_id').unsigned().notNullable().defaultTo(5).alter();
    table.primary(['day', 'client_id']);
    table
      .foreign('client_id')
      .references('id')
      .inTable('client')
      .onDelete('CASCADE');
  });
};

const down = async knex => {
  await knex.schema.alterTable('synced_day', table => {
    table.dropForeign('client_id');
    table.dropPrimary();
  });

  await knex.schema.alterTable('synced_day', table => {
    table.dropColumn('client_id');
    table.primary('day');
  });
};

export {up, down};
