import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import Service from 'App/Models/Service/Service'
import Database from '@ioc:Adonis/Lucid/Database'

import ServiceCreateValidator from 'App/Validators/Service/Admin/ServiceCreateValidator'
import ServiceUpdateValidator from 'App/Validators/Service/Admin/ServiceUpdateValidator'
import ServicePublicUpdateValidator from 'App/Validators/Service/Admin/ServicePublicUpdateValidator'
import ServiceTrendingUpdateValidator from 'App/Validators/Service/Admin/ServiceTrendingUpdateValidator'

export default class ServiceController {
  index = async ({ request, response }: HttpContextContract) => {
    const page = request.input('page', 1)
    const limit = 10

    let publicData = request.input('public', '1')
    if (publicData !== 'all') {
      if (publicData !== '0') {
        publicData = true
      } else {
        publicData = false
      }
    }

    let getServices: ModelPaginatorContract<Service> = await Service.query()
      .where((query) => {
        if (typeof publicData === 'boolean') {
          query.where('public', publicData)
        }
      })
      .preload('author')
      .withCount('bookings')
      .paginate(page, limit)

    return response.status(200).send({
      result: 'success',
      title: 'Success get Service Data',
      data: getServices.serialize(),
    })
  }

  show = async ({ params, response }: HttpContextContract) => {
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

  store = async ({ auth, request, response }: HttpContextContract) => {
    /**
     * Validate request body against the schema
     */
    await request.validate(ServiceCreateValidator)

    const serviceData = {
      ...request.only(['title', 'description', 'price']),
      created_by: auth?.user?.id,
    }

    const trx = await Database.transaction()

    try {
      await Service.create(serviceData, { client: trx })

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
      title: 'Success Save Service ' + request.input('title'),
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
    await request.validate(ServiceUpdateValidator)

    const serviceDataParams = request.only(['title', 'description', 'price'])

    if (Object.keys(serviceDataParams).length === 0) {
      return response.status(422).send({
        result: 'error',
        title: 'Nothing changed data',
      })
    }

    const serviceData = await Service.find(id)
    if (!serviceData) {
      return response.status(404).send({
        result: 'error',
        title: 'Service not found',
      })
    }

    const trx = await Database.transaction()

    try {
      serviceData.useTransaction(trx)
      serviceData.merge(serviceDataParams)
      await serviceData.save()

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
      title: 'Success Update Service ' + request.input('title'),
    })
  }

  updatePublic = async ({ request, response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Service',
      })
    }

    /**
     * Validate request body against the schema
     */
    await request.validate(ServicePublicUpdateValidator)

    const publicData = request.input('public')

    const serviceData = await Service.find(id)
    if (!serviceData) {
      return response.status(404).send({
        result: 'error',
        title: 'Service not found',
      })
    }

    if (publicData === Boolean(serviceData.public)) {
      return response.status(404).send({
        result: 'error',
        title: 'Public status not changed',
      })
    }

    const trx = await Database.transaction()

    try {
      serviceData.useTransaction(trx)
      serviceData.public = publicData

      await serviceData.save()

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
      title: 'Success Update Public Service ' + serviceData.title,
    })
  }

  updateTrending = async ({ request, response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Service',
      })
    }

    /**
     * Validate request body against the schema
     */
    await request.validate(ServiceTrendingUpdateValidator)

    const trendingData = request.input('trending')

    const serviceData = await Service.find(id)
    if (!serviceData) {
      return response.status(404).send({
        result: 'error',
        title: 'Service not found',
      })
    }

    if (trendingData === Boolean(serviceData.trending)) {
      return response.status(404).send({
        result: 'error',
        title: 'Trending status not changed',
      })
    }

    const trx = await Database.transaction()

    try {
      serviceData.useTransaction(trx)
      serviceData.trending = trendingData

      await serviceData.save()

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
      title: 'Success Update Trending Service ' + serviceData.title,
    })
  }

  destroy = async ({ response, params }: HttpContextContract) => {
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

    const trx = await Database.transaction()

    try {
      serviceData.useTransaction(trx)
      await serviceData.delete()

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
      title: 'Success Delete Service, ID: ' + id,
    })
  }

  restore = async ({ response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Service',
      })
    }

    const serviceData = await Service.onlyTrashed().where('id', id).first()
    if (!serviceData) {
      return response.status(404).send({
        result: 'error',
        title: 'Service Trash not found',
      })
    }

    const trx = await Database.transaction()

    try {
      serviceData.useTransaction(trx)
      await serviceData.restore()

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
      title: 'Success Restore Service, ID: ' + id,
    })
  }

  permanentDelete = async ({ response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Service',
      })
    }

    const serviceData = await Service.onlyTrashed().where('id', id).first()
    if (!serviceData) {
      return response.status(404).send({
        result: 'error',
        title: 'Service Trash not found',
      })
    }

    const trx = await Database.transaction()

    try {
      serviceData.useTransaction(trx)
      await serviceData.forceDelete()

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
      title: 'Success Force Delete Service, ID: ' + id,
    })
  }
}
