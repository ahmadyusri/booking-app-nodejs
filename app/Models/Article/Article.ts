import { compose } from '@ioc:Adonis/Core/Helpers'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
import { DateTime } from 'luxon'
import ArticleCategory from './ArticleCategory'
import User from '../User'

export default class Article extends compose(BaseModel, SoftDeletes) {
  static get table() {
    return 'articles'
  }

  @column({ isPrimary: true })
  public id: number

  @column()
  public category_id?: number

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
  public content: string

  @column({
    serializeAs: null,
    serialize: (value?: Number) => {
      return Boolean(value)
    },
  })
  public confirm: boolean

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

  @belongsTo(() => ArticleCategory, {
    localKey: 'id',
    foreignKey: 'category_id',
  })
  public category: BelongsTo<typeof ArticleCategory>
}
