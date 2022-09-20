import { column, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class APIToken extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column.dateTime()
  public expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => APIToken, {
    localKey: 'user_id',
    foreignKey: 'id',
  })
  public user: BelongsTo<typeof APIToken>
}
