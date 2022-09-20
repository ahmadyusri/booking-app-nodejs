import { Job, JobContract } from '@ioc:Rocketseat/Bull'
import Booking from 'App/Models/Service/Booking'
import Logger from '@ioc:Adonis/Core/Logger'
import EventStatus from 'App/Models/EventStatus'
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

export interface JobBookingReminderProps extends Job {
  data: {
    booking: Booking
    locale: string
  }
}

export default class BookingReminder implements JobContract {
  public key = 'BookingReminderJob'
  public feature: string = 'booking_reminder'

  private event_id: string
  private data_id: number

  public async handle(job: JobBookingReminderProps) {
    const { data } = job
    const { booking, locale } = data

    this.data_id = booking.id
    this.event_id = String(job.id)

    if (!booking.user) {
      Logger.warn(`User not found on BookingReminderJob, Booking ID: ${booking.id}.`)
      return
    }

    if (!booking.user) {
      Logger.warn(`User not found on BookingReminderJob, Booking ID: ${booking.id}.`)
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

    await new BookingReminderMailer(booking, {
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
