import { DateTime } from 'luxon'
import { afterDelete, BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from '../User'
import Service from './Service'
import Bull from '@ioc:Rocketseat/Bull'
import EventStatus from '../EventStatus'

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

  @afterDelete()
  public static async deleteJobs(booking: Booking) {
    // Get Event Status
    const eventStatus = await EventStatus.query().where('data_id', booking.id)
    eventStatus.forEach((item_status) => {
      const event_id = item_status.event_id
      const event_provider = item_status.event_provider

      if (event_id && event_provider) {
        // remove jobs
        Bull.remove(event_provider, event_id)
      }

      // Delete event status
      item_status.delete()
    })
  }

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
