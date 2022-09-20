import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Article from './Article'
import User from '../User'

export default class ArticleCategory extends BaseModel {
  static get table() {
    return 'article_categories'
  }

  public serializeExtras() {
    return {
      articles_count: this.$extras.articles_count,
    }
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

  @hasMany(() => Article, {
    localKey: 'id',
    foreignKey: 'category_id',
  })
  public articles: HasMany<typeof Article>
}
