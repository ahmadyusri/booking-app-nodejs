import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import EventStatus from 'App/Models/EventStatus'

export default class extends BaseSchema {
  protected tableName = EventStatus.table

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('feature', 100).notNullable()
      table.integer('data_id').unsigned().notNullable()
      table.string('event_provider').notNullable()
      table.string('event_id').nullable()
      table.string('status').notNullable()
      table.text('description').nullable()
      table.text('response').nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
