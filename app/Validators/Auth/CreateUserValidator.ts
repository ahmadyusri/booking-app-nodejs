import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   */
  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.minLength(3)]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: User.table, column: 'email' }),
    ]),
    password: schema.string({ trim: true }, [rules.minLength(8)]),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array.
   *
   */
  public messages: CustomMessages = {}
}
