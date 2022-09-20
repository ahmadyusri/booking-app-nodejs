import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'

import Article from 'App/Models/Article/Article'

export default class ArticleController {
  index = async ({ request, response }: HttpContextContract) => {
    const page = request.input('page', 1)
    const limit = 10

    const getArticle: ModelPaginatorContract<Article> = await Article.query()
      .where('confirm', 1)
      .where('public', 1)
      .preload('author')
      .preload('category')
      .paginate(page, limit)

    return response.status(200).send({
      result: 'success',
      title: 'Success get Article Data',
      data: getArticle.serialize(),
    })
  }

  show = async ({ params, response }: HttpContextContract) => {
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
}
