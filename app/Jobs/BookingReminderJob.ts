import { JobContract } from '@ioc:Rocketseat/Bull'
import Booking from 'App/Models/Service/Booking'
import Logger from '@ioc:Adonis/Core/Logger'
import EventStatus from 'App/Models/EventStatus'
import { v4 as uuid } from 'uuid'
import { formattedDate } from '../../utils/date'
import { DateTime } from 'luxon'
import BookingReminderMailer from 'App/Mailers/BookingReminderMailer'
import { appUrl } from 'Config/app'

/*
|--------------------------------------------------------------------------
| Job setup
|--------------------------------------------------------------------------
|
*/

interface JobBookingReminderProps {
  data: {
    booking: Booking
    locale: string
  }
}

export default class BookingReminder implements JobContract {
  public key = 'BookingReminderJob'
  private event_id: string
  private feature: string = 'booking_reminder'
  private data_id: number

  public async handle(job: JobBookingReminderProps) {
    const { data } = job
    const { booking, locale } = data

    if (!booking.user) {
      Logger.warn(`User not found on BookingPurchasedJob, Booking ID: ${booking.id}.`)
      return
    }

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

    await new BookingReminderMailer(booking, {
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

  public async onCompleted(_job) {
    console.log('onCompleted', this.key, _job.data?.booking?.id ?? _job.data)
  }
}
