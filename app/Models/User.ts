import Hash from '@ioc:Adonis/Core/Hash'
import { DateTime } from 'luxon'
import { column, beforeSave, BaseModel, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import { compose } from '@ioc:Adonis/Core/Helpers'
import APIToken from './APIToken'

export default class User extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  public id: number

  @column()
  public timezone?: string

  @column()
  public name: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(User: User) {
    if (User.$dirty.password) {
      User.password = await Hash.make(User.password)
    }
  }

  @hasMany(() => APIToken, {
    localKey: 'id',
    foreignKey: 'user_id',
  })
  public api_tokens: HasMany<typeof APIToken>
}
