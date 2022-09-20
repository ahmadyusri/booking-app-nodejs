import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Article from 'App/Models/Article/Article'
import ArticleCategory from 'App/Models/Article/ArticleCategory'

export default class extends BaseSchema {
  protected tableName = Article.table

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('category_id').unsigned().nullable()
      table.string('thumbnail', 200).nullable()
      table.string('title', 100).notNullable()
      table.string('slug', 100).nullable()
      table.text('keywords').nullable()
      table.string('description', 250).notNullable()
      table.text('content').notNullable()
      table.boolean('confirm').notNullable().defaultTo(false)
      table.boolean('trending').notNullable().defaultTo(false)
      table.boolean('public').notNullable().defaultTo(true)
      table.integer('created_by').unsigned().notNullable()

      table
        .foreign('category_id')
        .references('id')
        .inTable(ArticleCategory.table)
        .onDelete('set null')

      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.timestamps()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
