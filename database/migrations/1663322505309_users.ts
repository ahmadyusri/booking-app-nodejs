import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('timezone', 100).nullable()
      table.string('name', 50).notNullable()
      table.string('email', 255).unique().notNullable()
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()

      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.timestamps()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
