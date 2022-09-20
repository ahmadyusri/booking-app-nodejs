import { compose } from '@ioc:Adonis/Core/Helpers'
import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import User from '../User'
import Booking from './Booking'

export default class Service extends compose(BaseModel, SoftDeletes) {
  static get table() {
    return 'service_services'
  }

  @column({ isPrimary: true })
  public id: number

  @column()
  public thumbnail?: string

  @column()
  public title: string

  @column()
  public slug?: string

  @column()
  public keywords?: string

  @column()
  public description: string

  @column()
  public price: number

  @column({
    serialize: (value?: Number) => {
      return Boolean(value)
    },
  })
  public trending: boolean

  @column({
    serializeAs: null,
    serialize: (value?: Number) => {
      return Boolean(value)
    },
  })
  public public: boolean

  @column()
  public created_by?: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'created_by',
  })
  public author: BelongsTo<typeof User>

  @hasMany(() => Booking, {
    localKey: 'id',
    foreignKey: 'service_id',
  })
  public bookings: HasMany<typeof Booking>
}
