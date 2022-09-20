import I18n, { I18nContract } from '@ioc:Adonis/Addons/I18n'
import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'

export default class NewUserMailer extends BaseMailer {
  protected i18n: I18nContract

  constructor(private user: User, private additionalData: any) {
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
   * "NewUserMailer.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public prepare(message: MessageContract) {
    message
      .subject(this.i18n.formatMessage('auth.email.welcome_subject'))
      .from('info@booking-app.com')
      .to(this.user.email)
      .messageId(this.additionalData.event_id)
      .htmlView('emails/welcome', {
        feature: this.additionalData.feature,
        data_id: this.additionalData.data_id,
        user: this.user,
        url: this.additionalData.verification_pageurl,
      })
  }
}
