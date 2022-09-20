import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ArticleCategory from 'App/Models/Article/ArticleCategory'
import Database from '@ioc:Adonis/Lucid/Database'
import ArticleCategoryStoreValidator from 'App/Validators/Article/Admin/ArticleCategoryStoreValidator'
import ArticleCategoryUpdateValidator from 'App/Validators/Article/Admin/ArticleCategoryUpdateValidator'

export default class ArticleController {
  index = async ({ request, response }: HttpContextContract) => {
    const page = request.input('page', 1)
    const limit = 10

    const getArticleCategory = await ArticleCategory.query()
      .preload('author')
      .withCount('articles')
      .paginate(page, limit)

    return response.status(200).send({
      result: 'success',
      title: 'Success get Article Category Data',
      data: getArticleCategory.serialize(),
    })
  }

  show = async ({ response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Article Category',
      })
    }

    const articleCategory = await ArticleCategory.find(id)
    if (!articleCategory) {
      return response.status(404).send({
        result: 'error',
        title: 'Article Category not found',
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Get Article Category',
      data: articleCategory.serialize(),
    })
  }

  store = async ({ auth, request, response }: HttpContextContract) => {
    /**
     * Validate request body against the schema
     */
    await request.validate(ArticleCategoryStoreValidator)

    const articleCategoryData = {
      ...request.only(['title']),
      created_by: auth?.user?.id,
    }

    const trx = await Database.transaction()

    try {
      await ArticleCategory.create(articleCategoryData, { client: trx })

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
      title: 'Success Save Article Category ' + request.input('title'),
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
    await request.validate(ArticleCategoryUpdateValidator)

    const articleCategoryParams = request.only(['title'])

    const articleCategory = await ArticleCategory.find(id)
    if (!articleCategory) {
      return response.status(404).send({
        result: 'error',
        title: 'Article Categoty not found',
      })
    }

    const trx = await Database.transaction()

    try {
      articleCategory.useTransaction(trx)
      articleCategory.merge(articleCategoryParams)
      await articleCategory.save()

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
      title: 'Success Update Article Category ' + request.input('title'),
    })
  }

  destroy = async ({ response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Article Category',
      })
    }

    const articleCategory = await ArticleCategory.find(id)
    if (!articleCategory) {
      return response.status(404).send({
        result: 'error',
        title: 'Article not found',
      })
    }

    const trx = await Database.transaction()

    try {
      articleCategory.useTransaction(trx)
      await articleCategory.delete()

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
      title: 'Success Delete Article Category, ID: ' + id,
    })
  }
}
