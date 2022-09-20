import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Booking from 'App/Models/Service/Booking'
import Service from 'App/Models/Service/Service'

export default class extends BaseSchema {
  protected tableName = Booking.table

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().notNullable()
      table.integer('service_id').unsigned().notNullable()

      table.dateTime('booking_time').notNullable()
      table.string('timezone', 100).notNullable().comment('Current Timezone on saving')

      table.foreign('service_id').references('id').inTable(Service.table).onDelete('CASCADE')

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
