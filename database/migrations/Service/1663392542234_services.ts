import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Service from 'App/Models/Service/Service'

export default class extends BaseSchema {
  protected tableName = Service.table

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('thumbnail', 200).nullable()
      table.string('title', 100).notNullable()
      table.string('slug', 100).nullable()
      table.text('keywords').nullable()
      table.string('description', 250).notNullable()
      table.decimal('price', 15, 2).notNullable()

      table.boolean('trending').notNullable().defaultTo(0)
      table.boolean('public').notNullable().defaultTo(1)
      table.integer('created_by').unsigned().notNullable()

	  table.timestamp('deleted_at', { useTz: true }).nullable()
      table.timestamps()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
