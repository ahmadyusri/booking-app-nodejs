import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import ArticleCategory from 'App/Models/Article/ArticleCategory'

export default class extends BaseSchema {
  protected tableName = ArticleCategory.table

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('thumbnail', 200).nullable()
      table.string('title', 50).notNullable()
      table.string('slug', 100).nullable()
      table.integer('created_by').unsigned().notNullable()

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
