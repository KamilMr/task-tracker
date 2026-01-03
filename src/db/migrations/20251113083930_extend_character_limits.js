const up = knex => {
  return knex.schema
    .alterTable('task', table => {
      table.string('title', 100).notNullable().alter();
    })
    .alterTable('project', table => {
      table.string('name', 50).notNullable().alter();
    })
    .alterTable('client', table => {
      table.string('name', 50).notNullable().alter();
    });
};

const down = knex => {
  return knex.schema
    .alterTable('task', table => {
      table.string('title', 24).notNullable().alter();
    })
    .alterTable('project', table => {
      table.string('name', 24).notNullable().alter();
    })
    .alterTable('client', table => {
      table.string('name', 24).notNullable().alter();
    });
};

export {up, down};
