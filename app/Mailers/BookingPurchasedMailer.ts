import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import I18n, { I18nContract } from '@ioc:Adonis/Addons/I18n'
import Booking from 'App/Models/Service/Booking'
import { appName } from 'Config/app'

export interface AdditionalDataProps {
  event: {
    id: string
    provider: string
  }
  feature: string
  data_id: string | number
  booking_pageurl: string
  formatted_booking_time: string
  locale?: string
}

export default class BookingPurchasedMailer extends BaseMailer {
  protected i18n: I18nContract

  constructor(private booking: Booking, private additionalData: AdditionalDataProps) {
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
   * "BookingPurchasedMailer.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public prepare(message: MessageContract) {
    message
      .subject(this.i18n.formatMessage('booking.email.purchased.mail_subject'))
      .from('info@booking-app.com', appName)
      .to(this.booking.user.email)
      .messageId(this.additionalData.event.id)
      .htmlView('emails/booking/purchased', {
        event: this.additionalData.event,
        feature: this.additionalData.feature,
        data_id: this.additionalData.data_id,
        booking: this.booking,
        formatted_booking_time: this.additionalData.formatted_booking_time,
        url: this.additionalData.booking_pageurl,
      })
  }
}
