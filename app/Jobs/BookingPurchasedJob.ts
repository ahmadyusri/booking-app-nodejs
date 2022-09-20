import { JobContract } from '@ioc:Rocketseat/Bull'
import Booking from 'App/Models/Service/Booking'
import Logger from '@ioc:Adonis/Core/Logger'
import BookingPurchasedMailer from 'App/Mailers/BookingPurchasedMailer'
import { DateTime } from 'luxon'
import { formattedDate } from '../../utils/date'
import { v4 as uuid } from 'uuid'
import EventStatus from 'App/Models/EventStatus'
import { appUrl } from 'Config/app'

/*
|--------------------------------------------------------------------------
| Job setup
|--------------------------------------------------------------------------
|
*/

interface BookingPurchasedJobProps {
  data: {
    booking: Booking
    locale: string
  }
}

export default class BookingPurchasedJob implements JobContract {
  public key = 'BookingPurchasedJob'
  private event_id: string
  private feature: string = 'booking_puchased'
  private data_id: number

  public async handle(job: BookingPurchasedJobProps) {
    const { data } = job
    const { booking, locale } = data

    if (!booking.user) {
      Logger.warn(`User not found on BookingPurchasedJob, Booking ID: ${booking.id}.`)
      return
    }

    const formattedBookingTime = formattedDate({
      formattedInfo: `Booking ID: ${booking.id}`,
      dateTime: booking.booking_time,
      timezone: booking.timezone,
      userTimezone: booking?.user?.timezone,
    })

    let formatted_booking_time: string = ''
    if (typeof formattedBookingTime === 'string') {
      formatted_booking_time = formattedBookingTime
    } else if (formattedBookingTime instanceof DateTime) {
      formatted_booking_time = `${formattedBookingTime.toFormat('dd MMM yyyy HH:mm')}, ${
        formattedBookingTime.zoneName
      }`
    }

    const bookingPage: string = appUrl + '/page/service/booking/' + booking.id

    this.data_id = booking.id
    this.event_id = uuid()

    EventStatus.create({
      feature: this.feature,
      data_id: this.data_id,
      event_id: this.event_id,
      event_provider: 'mail',
      status: 'sending',
      description: 'Sending',
    })

    await new BookingPurchasedMailer(booking, {
      locale: locale,
      booking_pageurl: bookingPage,
      formatted_booking_time: formatted_booking_time,
      feature: this.feature,
      data_id: this.data_id,
      event_id: this.event_id,
    }).send()
  }

  public async onFailed(_job: any, _error: any) {
    EventStatus.create({
      feature: this.feature,
      data_id: this.data_id,
      event_id: this.event_id,
      event_provider: 'mail',
      status: 'error',
      description: _error?.message,
    })
  }

  public async onCompleted(_job: any) {
    console.log('onCompleted', this.key, _job.data?.booking?.id ?? _job.data)
  }
}
