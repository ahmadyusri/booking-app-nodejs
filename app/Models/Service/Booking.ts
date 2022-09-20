import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from '../User'
import Service from './Service'

export default class Booking extends BaseModel {
  static get table() {
    return 'service_bookings'
  }

  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public service_id: number

  @column.dateTime({
    serialize(value: DateTime, _attribute, model) {
      const formatTime = 'yyyy-MM-dd HH:mm:ss'

      return DateTime.fromFormat(value.toFormat(formatTime), formatTime, {
        zone: model.$attributes.timezone,
      }).toFormat(formatTime)
    },
  })
  public booking_time: DateTime

  @column()
  public timezone: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Service, {
    localKey: 'id',
    foreignKey: 'service_id',
  })
  public service: BelongsTo<typeof Service>
}
