import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import Booking from 'App/Models/Service/Booking'

export default class BookingController {
  public index = async ({ request, response }: HttpContextContract) => {
    const page = request.input('page', 1)
    const limit = 10

    let getBookings: ModelPaginatorContract<Booking> = await Booking.query()
      .preload('user')
      .preload('service')
      .paginate(page, limit)

    return response.status(200).send({
      result: 'success',
      title: 'Success get Bookings Data',
      data: getBookings.serialize(),
    })
  }

  public show = async ({ params, response }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Booking',
      })
    }

    const bookingData = await Booking.query()
      .preload('service')
      .preload('user')
      .where('id', id)
      .first()
    if (!bookingData) {
      return response.status(404).send({
        result: 'error',
        title: 'Booking not found',
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Get Booking',
      data: bookingData.serialize(),
    })
  }

  public destroy = async ({ response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Booking',
      })
    }

    const bookingData = await Booking.find(id)
    if (!bookingData) {
      return response.status(404).send({
        result: 'error',
        title: 'Booking not found',
      })
    }

    const trx = await Database.transaction()

    try {
      bookingData.useTransaction(trx)
      await bookingData.delete()

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
      title: 'Success Delete Booking, ID: ' + id,
    })
  }
}
