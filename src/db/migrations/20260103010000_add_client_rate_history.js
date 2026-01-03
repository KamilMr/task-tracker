const up = async knex => {
  await knex.schema.createTable('client_rate_history', table => {
    table.increments('id').unsigned().primary();
    table.integer('client_id').unsigned().notNullable();
    table.integer('hourly_rate').unsigned().notNullable();
    table.string('currency', 3).notNullable().defaultTo('PLN');
    table.date('effective_from').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('client_id').references('id').inTable('client').onDelete('CASCADE');
    table.index(['client_id', 'effective_from']);
  });

  // Migrate existing rates to history
  const clients = await knex('client').whereNotNull('hourly_rate');
  for (const client of clients) {
    await knex('client_rate_history').insert({
      client_id: client.id,
      hourly_rate: client.hourly_rate,
      currency: client.currency || 'PLN',
      effective_from: knex.fn.now(),
    });
  }
};

const down = knex => knex.schema.dropTableIfExists('client_rate_history');

export {up, down};
