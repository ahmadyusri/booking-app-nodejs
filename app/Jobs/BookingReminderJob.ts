import { Job, JobContract, QueueOptions, WorkerOptions } from '@ioc:Rocketseat/Bull'
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

import Env from '@ioc:Adonis/Core/Env'
const prefix = Env.get('BULL_PREFIX')

export default class BookingReminder implements JobContract {
  public key = 'BookingReminderJob'
  public feature: string = 'booking_reminder'

  private event_id: string
  private data_id: number

  public queueOptions: QueueOptions = {
    prefix,
  }

  public workerOptions: WorkerOptions = {
    prefix,
  }

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

    const formattedDateBookingTime = formattedDate({
      formattedInfo: `Booking ID: ${booking.id}`,
      dateTime: booking.booking_time,
      timezone: booking.timezone,
      userTimezone: booking?.user?.timezone,
    })

    let formattedBookingTime: string = ''
    if (typeof formattedDateBookingTime === 'string') {
      formattedBookingTime = formattedDateBookingTime
    } else if (formattedDateBookingTime instanceof DateTime) {
      formattedBookingTime = `${formattedDateBookingTime.toFormat('dd MMM yyyy HH:mm')}, ${
        formattedDateBookingTime.zoneName
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
      formatted_booking_time: formattedBookingTime,
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
