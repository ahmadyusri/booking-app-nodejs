import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ArticleCategory from 'App/Models/Article/ArticleCategory'

export default class ArticleUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   */
  public schema = schema.create({
    category_id: schema.number.optional([
      rules.exists({ table: ArticleCategory.table, column: 'id' }),
    ]),
    title: schema.string.optional(),
    description: schema.string.optional(),
    content: schema.string.optional(),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array.
   *
   */
  public messages: CustomMessages = {}
}
