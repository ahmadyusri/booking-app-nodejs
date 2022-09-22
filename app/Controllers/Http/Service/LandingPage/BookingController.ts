import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'
import Booking from 'App/Models/Service/Booking'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Service from 'App/Models/Service/Service'
import Bull from '@ioc:Rocketseat/Bull'
import BookingPurchasedJob from 'App/Jobs/BookingPurchasedJob'
import BookingReminderJob from 'App/Jobs/BookingReminderJob'
import Logger from '@ioc:Adonis/Core/Logger'
import { DateTime, Duration } from 'luxon'
import EventStatus from 'App/Models/EventStatus'
import { v4 as uuid } from 'uuid'

export default class BookingController {
  public index = async ({ auth, request, response }: HttpContextContract) => {
    const page = request.input('page', 1)
    const limit = 10

    if (!auth.user) {
      return response.status(401).send({
        result: 'error',
        title: 'Failed get Auth',
      })
    }

    const userId: number = auth.user.id

    let getArticle: ModelPaginatorContract<Booking> = await Booking.query()
      .where('user_id', userId)
      .preload('service')
      .paginate(page, limit)

    return response.status(200).send({
      result: 'success',
      title: 'Success get Bookings Data',
      data: getArticle.serialize(),
    })
  }

  public show = async ({ auth, params, response }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Booking',
      })
    }

    if (!auth.user) {
      return response.status(401).send({
        result: 'error',
        title: 'Failed get Auth',
      })
    }

    const userId: number = auth.user.id

    const bookingData = await Booking.query().preload('service').where('id', id).first()
    if (!bookingData) {
      return response.status(404).send({
        result: 'error',
        title: 'Booking not found',
      })
    }

    if (bookingData.user_id !== userId) {
      return response.status(200).send({
        result: 'error',
        title: 'You cannot access this booking.',
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Get Booking',
      data: bookingData.serialize(),
    })
  }

  public order = async ({ i18n, auth, request, response }: HttpContextContract) => {
    if (!auth.user) {
      return response.status(401).send({
        result: 'error',
        title: 'Failed get Auth',
      })
    }

    const userId: number = auth.user.id

    const formatTime = 'yyyy-MM-dd HH:mm:ss'
    const localTimezone = DateTime.local().zoneName
    let timezone = request.input('timezone')
    if (timezone) {
      if (!DateTime.local().setZone(timezone).isValid) {
        return response.status(200).send({
          result: 'error',
          title: 'Invalid Timezone',
        })
      }
    } else {
      timezone = localTimezone
    }

    // Update to Local Timezone
    const bookingTimeLocalTimezone = DateTime.fromFormat(
      request.input('booking_time'),
      formatTime,
      {
        zone: timezone,
      }
    ).setZone(localTimezone)

    if (!bookingTimeLocalTimezone.isValid) {
      return response.status(200).send({
        result: 'error',
        title: 'Invalid Set Local Timezone, Please Try Again',
      })
    }

    request.updateBody({
      ...request.body(),
      booking_time_validate: bookingTimeLocalTimezone.toFormat(formatTime),
    })

    /**
     * Schema definition
     */
    const newRequestSchema = schema.create({
      service_id: schema.number([rules.exists({ table: Service.table, column: 'id' })]),
      booking_time_validate: schema.date({ format: formatTime }, [rules.after(10, 'minute')]),
      timezone: schema.string.optional({ trim: true }),
    })

    /**
     * Validate request body against the schema
     */
    await request.validate({ schema: newRequestSchema })

    // Update to Local Timezone
    const bookingTime = DateTime.fromFormat(request.input('booking_time'), formatTime, {
      zone: timezone,
    }).setZone(timezone)

    if (!bookingTime.isValid) {
      return response.status(200).send({
        result: 'error',
        title: 'Invalid Set Timezone, Please Try Again',
      })
    }

    const bookingParams = {
      ...request.only(['service_id']),

      booking_time: bookingTime,
      timezone: bookingTime.zoneName,
      user_id: userId,
    }

    const trx = await Database.transaction()

    try {
      const saveProcess = await Booking.create(bookingParams, { client: trx })

      await trx.commit()

      const bookingData = await Booking.query()
        .where('id', saveProcess.id)
        .preload('user')
        .preload('service')
        .first()

      if (!bookingData) {
        Logger.warn(`Failed send Notification, Booking not found, Booking ID: ${saveProcess.id}.`)
      } else {
        const jobId = uuid()
        /*
         * Run Job
         * attempt 3 times on failed, every 2 minutes
         */
        Bull.add(
          new BookingPurchasedJob().key,
          { booking: bookingData, locale: i18n.locale },
          { jobId, attempts: 3, backoff: { type: 'fixed', delay: 120000 } }
        )

        const diffMinutes: Duration = bookingTimeLocalTimezone
          .minus({ minutes: 30 })
          .diffNow('minutes')

        if (diffMinutes.minutes > 0) {
          const bookingReminderJob = new BookingReminderJob()
          const jobId = uuid()
          EventStatus.updateOrCreate(
            {
              event_id: jobId,
            },
            {
              feature: bookingReminderJob.feature,
              data_id: bookingData.id,
              event_id: jobId,
              event_provider: bookingReminderJob.key,
              status: 'pending',
              description: 'Pending',
              response: '',
            }
          )

          /*
           * Run Schedule reminder 20 minutes before Booking Time
           * attempt 3 times on failed, every 2 minutes
           */
          Bull.schedule(
            bookingReminderJob.key,
            { booking: bookingData, locale: i18n.locale, jobId },
            bookingTimeLocalTimezone.minus({ minutes: 20 }).toJSDate(),
            { jobId: jobId, attempts: 3, backoff: { type: 'fixed', delay: 120000 } }
          )
        }
      }

      return response.status(200).send({
        result: 'success',
        title: 'Success Booking Service',
      })
    } catch (error) {
      await trx.rollback()

      return response.status(500).send({
        result: 'error',
        title: error.message,
      })
    }
  }

  public destroy = async ({ auth, response, params }: HttpContextContract) => {
    const { id } = params
    if (!id) {
      return response.status(422).send({
        result: 'error',
        title: 'Please Select Booking',
      })
    }

    if (!auth.user) {
      return response.status(401).send({
        result: 'error',
        title: 'Failed get Auth',
      })
    }

    const userId: number = auth.user.id

    const bookingData = await Booking.find(id)
    if (!bookingData) {
      return response.status(404).send({
        result: 'error',
        title: 'Booking not found',
      })
    }

    if (userId !== bookingData.user_id) {
      return response.status(404).send({
        result: 'error',
        title: "You don't have permission to access this booking",
      })
    }

    const trx = await Database.transaction()

    try {
      bookingData.useTransaction(trx)
      await bookingData.delete()

      await trx.commit()
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
