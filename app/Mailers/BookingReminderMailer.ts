import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import I18n, { I18nContract } from '@ioc:Adonis/Addons/I18n'
import Booking from 'App/Models/Service/Booking'

export default class BookingReminderMailer extends BaseMailer {
  protected i18n: I18nContract

  constructor(private booking: Booking, private additionalData: any) {
    super()

    this.i18n = I18n.locale(additionalData.locale ?? I18n.defaultLocale)
  }

  /**
   * USE A DIFFERENT MAILER
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  /**
   * The prepare method is invoked automatically when run
   * "BookingReminderMailer.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public prepare(message: MessageContract) {
    message
      .subject(this.i18n.formatMessage('booking.email.reminder.mail_subject'))
      .from('info@booking-app.com')
      .to(this.booking.user.email)
      .messageId(this.additionalData.event_id)
      .htmlView('emails/booking/reminder', {
        feature: this.additionalData.feature,
        data_id: this.additionalData.data_id,
        booking: this.booking,
        formatted_booking_time: this.additionalData.formatted_booking_time,
        url: this.additionalData.booking_pageurl,
      })
  }
}
