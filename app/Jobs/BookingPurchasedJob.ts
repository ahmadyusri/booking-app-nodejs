import { Job, JobContract } from '@ioc:Rocketseat/Bull'
import Booking from 'App/Models/Service/Booking'
import Logger from '@ioc:Adonis/Core/Logger'
import BookingPurchasedMailer from 'App/Mailers/BookingPurchasedMailer'
import { DateTime } from 'luxon'
import { formattedDate } from '../../utils/date'
import EventStatus from 'App/Models/EventStatus'
import { appUrl } from 'Config/app'

/*
|--------------------------------------------------------------------------
| Job setup
|--------------------------------------------------------------------------
|
*/

export interface BookingPurchasedJobProps extends Job {
  data: {
    booking: Booking
    locale: string
  }
}

export default class BookingPurchasedJob implements JobContract {
  public key = 'BookingPurchasedJob'
  public feature: string = 'booking_puchased'

  private event_id: string
  private data_id: number

  public async handle(job: BookingPurchasedJobProps) {
    const { data } = job
    const { booking, locale } = data

    this.event_id = String(job.id)
    this.data_id = booking.id

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

    EventStatus.updateOrCreate(
      {
        event_id: this.event_id,
      },
      {
        feature: this.feature,
        data_id: this.data_id,
        event_id: this.event_id,
        event_provider: this.key,
        status: 'sending',
        description: 'Sending',
        response: '',
      }
    )

    await new BookingPurchasedMailer(booking, {
      locale: locale,
      booking_pageurl: bookingPage,
      formatted_booking_time: formatted_booking_time,
      feature: this.feature,
      data_id: this.data_id,
      event: {
        provider: this.key,
        id: this.event_id,
      },
    }).send()
  }

  public async onFailed(_job: any, _error: any) {
    EventStatus.updateOrCreate(
      {
        event_id: this.event_id,
      },
      {
        event_id: this.event_id,
        event_provider: this.key,
        feature: this.feature,
        data_id: this.data_id,
        status: 'error',
        description: 'Failed Send Mail',
        response: _error?.message,
      }
    )
  }
}
