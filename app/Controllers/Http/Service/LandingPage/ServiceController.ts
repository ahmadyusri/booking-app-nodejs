import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import Service from 'App/Models/Service/Service'

export default class ServiceController {
  public index = async ({ auth, request, response }: HttpContextContract) => {
    const page = request.input('page', 1)
    const limit = 10

    let queryServices = Service.query()

    const userId = auth.user?.id
    if (auth.isLoggedIn && userId) {
      queryServices = queryServices.preload('bookings', (query) => {
        query.where('user_id', userId)
      })
    }
    queryServices = queryServices.preload('author')

    const getServices: ModelPaginatorContract<Service> = await queryServices.paginate(page, limit)

    return response.status(200).send({
      result: 'success',
      title: 'Success get Service Data',
      data: getServices.serialize(),
    })
  }

  public show = async ({ params, response }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Service',
      })
    }

    const serviceData = await Service.find(id)
    if (!serviceData) {
      return response.status(404).send({
        result: 'error',
        title: 'Service not found',
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Get Service',
      data: serviceData.serialize(),
    })
  }
}
