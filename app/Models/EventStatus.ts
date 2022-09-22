import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class EventStatus extends BaseModel {
  public static get table() {
    return 'event_statuses'
  }

  @column({ isPrimary: true })
  public id: number

  @column()
  public feature: string

  @column()
  public data_id: number

  @column()
  public event_provider: string

  @column()
  public event_id?: string

  @column()
  public status: string

  @column()
  public description?: string

  @column()
  public response?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
