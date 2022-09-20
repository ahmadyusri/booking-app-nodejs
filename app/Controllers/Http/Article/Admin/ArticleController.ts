import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Article from 'App/Models/Article/Article'
import Database from '@ioc:Adonis/Lucid/Database'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import ArticleStoreValidator from 'App/Validators/Article/Admin/ArticleStoreValidator'
import ArticleUpdateValidator from 'App/Validators/Article/Admin/ArticleUpdateValidator'
import ArticleConfirmUpdateValidator from 'App/Validators/Article/Admin/ArticleConfirmUpdateValidator'
import ArticlePublicUpdateValidator from 'App/Validators/Article/Admin/ArticlePublicUpdateValidator'
import ArticleTrendingUpdateValidator from 'App/Validators/Article/Admin/ArticleTrendingUpdateValidator'

export default class ArticleController {
  index = async ({ request, response }: HttpContextContract) => {
    const page = request.input('page', 1)
    const limit = 10

    let confirmData = request.input('confirm', '1')
    if (confirmData !== 'all') {
      if (confirmData !== '0') {
        confirmData = true
      } else {
        confirmData = false
      }
    }

    let publicData = request.input('public', '1')
    if (publicData !== 'all') {
      if (publicData !== '0') {
        publicData = true
      } else {
        publicData = false
      }
    }

    let getArticle: ModelPaginatorContract<Article> = await Article.query()
      .where((query) => {
        if (typeof confirmData === 'boolean') {
          query.where('confirm', confirmData)
        }
      })
      .where((query) => {
        if (typeof publicData === 'boolean') {
          query.where('public', publicData)
        }
      })
      .preload('author')
      .preload('category')
      .paginate(page, limit)

    return response.status(200).send({
      result: 'success',
      title: 'Success get Article Data',
      data: getArticle.serialize(),
    })
  }

  show = async ({ response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Article',
      })
    }

    const article = await Article.find(id)
    if (!article) {
      return response.status(404).send({
        result: 'error',
        title: 'Article not found',
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Get Article',
      data: article.serialize(),
    })
  }

  store = async ({ auth, request, response }: HttpContextContract) => {
    /**
     * Validate request body against the schema
     */
    await request.validate(ArticleStoreValidator)

    const articleData = {
      ...request.only(['category_id', 'title', 'description', 'content']),
      confirm: true,
      created_by: auth?.user?.id,
    }

    const trx = await Database.transaction()

    try {
      await Article.create(articleData, { client: trx })

      trx.commit()
    } catch (error) {
      await trx.rollback()

      return response.status(500).send({
        result: 'error',
        title: error.message,
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Save Article ' + request.input('title'),
    })
  }

  update = async ({ request, response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Article',
      })
    }

    /**
     * Validate request body against the schema
     */
    await request.validate(ArticleUpdateValidator)

    const articleParams = request.only(['category_id', 'title', 'description', 'content'])

    if (Object.keys(articleParams).length === 0) {
      return response.status(422).send({
        result: 'error',
        title: 'Nothing changed data',
      })
    }

    const article = await Article.find(id)
    if (!article) {
      return response.status(404).send({
        result: 'error',
        title: 'Article not found',
      })
    }

    const trx = await Database.transaction()

    try {
      article.useTransaction(trx)
      article.merge(articleParams)
      await article.save()

      trx.commit()
    } catch (error) {
      await trx.rollback()

      return response.status(500).send({
        result: 'error',
        title: error.message,
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Update Article ' + article.title,
    })
  }

  destroy = async ({ response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Article',
      })
    }

    const article = await Article.find(id)
    if (!article) {
      return response.status(404).send({
        result: 'error',
        title: 'Article not found',
      })
    }

    const trx = await Database.transaction()

    try {
      article.useTransaction(trx)
      await article.delete()

      trx.commit()
    } catch (error) {
      await trx.rollback()

      return response.status(500).send({
        result: 'error',
        title: error.message,
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Delete Article, ID: ' + id,
    })
  }

  updateConfirm = async ({ request, response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Article',
      })
    }

    /**
     * Validate request body against the schema
     */
    await request.validate(ArticleConfirmUpdateValidator)

    const confirm = request.input('confirm')

    const article = await Article.find(id)
    if (!article) {
      return response.status(404).send({
        result: 'error',
        title: 'Article not found',
      })
    }

    if (confirm === Boolean(article.confirm)) {
      return response.status(404).send({
        result: 'error',
        title: 'Confirm status not changed',
      })
    }

    const trx = await Database.transaction()

    try {
      article.useTransaction(trx)
      article.confirm = confirm

      await article.save()

      trx.commit()
    } catch (error) {
      await trx.rollback()

      return response.status(500).send({
        result: 'error',
        title: error.message,
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Update Confirm Article ' + article.title,
    })
  }

  updatePublic = async ({ request, response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Article',
      })
    }

    /**
     * Validate request body against the schema
     */
    await request.validate(ArticlePublicUpdateValidator)

    const publicData = request.input('public')

    const article = await Article.find(id)
    if (!article) {
      return response.status(404).send({
        result: 'error',
        title: 'Article not found',
      })
    }

    if (publicData === Boolean(article.public)) {
      return response.status(404).send({
        result: 'error',
        title: 'Public status not changed',
      })
    }

    const trx = await Database.transaction()

    try {
      article.useTransaction(trx)
      article.public = publicData

      await article.save()

      trx.commit()
    } catch (error) {
      await trx.rollback()

      return response.status(500).send({
        result: 'error',
        title: error.message,
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Update Public Article ' + article.title,
    })
  }

  updateTrending = async ({ request, response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Article',
      })
    }

    /**
     * Validate request body against the schema
     */
    await request.validate(ArticleTrendingUpdateValidator)

    const trendingData = request.input('trending')

    const article = await Article.find(id)
    if (!article) {
      return response.status(404).send({
        result: 'error',
        title: 'Article not found',
      })
    }

    if (trendingData === Boolean(article.trending)) {
      return response.status(404).send({
        result: 'error',
        title: 'Trending status not changed',
      })
    }

    const trx = await Database.transaction()

    try {
      article.useTransaction(trx)
      article.trending = trendingData

      await article.save()

      trx.commit()
    } catch (error) {
      await trx.rollback()

      return response.status(500).send({
        result: 'error',
        title: error.message,
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Update Trending Article ' + article.title,
    })
  }

  restore = async ({ response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Article',
      })
    }

    const article = await Article.onlyTrashed().where('id', id).first()
    if (!article) {
      return response.status(404).send({
        result: 'error',
        title: 'Article Trash not found',
      })
    }

    const trx = await Database.transaction()

    try {
      article.useTransaction(trx)
      await article.restore()

      trx.commit()
    } catch (error) {
      await trx.rollback()

      return response.status(500).send({
        result: 'error',
        title: error.message,
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Restore Article, ID: ' + id,
    })
  }

  permanentDelete = async ({ response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Article',
      })
    }

    const article = await Article.onlyTrashed().where('id', id).first()
    if (!article) {
      return response.status(404).send({
        result: 'error',
        title: 'Article Trash not found',
      })
    }

    const trx = await Database.transaction()

    try {
      article.useTransaction(trx)
      await article.forceDelete()

      trx.commit()
    } catch (error) {
      await trx.rollback()

      return response.status(500).send({
        result: 'error',
        title: error.message,
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Force Delete Article, ID: ' + id,
    })
  }
}
