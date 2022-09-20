import { JobContract } from '@ioc:Rocketseat/Bull'
import User from 'App/Models/User'
import NewUserMailer from 'App/Mailers/NewUserMailer'
import EventStatus from 'App/Models/EventStatus'
import { v4 as uuid } from 'uuid'
import { appUrl } from 'Config/app'

/*
|--------------------------------------------------------------------------
| Job setup
|--------------------------------------------------------------------------
|
*/

interface NewUserJobProps {
  data: {
    user: User
    locale: string
  }
}

export default class NewUserJob implements JobContract {
  public key = 'NewUserJob'
  private event_id: string
  private feature: string = 'new_user'
  private data_id: number

  public async handle(job: NewUserJobProps) {
    const { data } = job
    const { user, locale } = data

    let verification_pageurl: string = appUrl + '/user/verification'

    this.data_id = user.id
    this.event_id = uuid()

    EventStatus.create({
      feature: this.feature,
      data_id: this.data_id,
      event_id: this.event_id,
      event_provider: 'mail',
      status: 'sending',
      description: 'Sending',
    })

    await new NewUserMailer(user, {
      locale: locale,
      verification_pageurl: verification_pageurl,
      feature: this.feature,
      data_id: this.data_id,
      event_id: this.event_id,
    }).send()
  }

  public async onFailed(_job, _error) {
    EventStatus.create({
      feature: this.feature,
      data_id: this.data_id,
      event_provider: 'mail',
      event_id: this.event_id,
      status: 'error',
      description: _error?.message,
    })
  }

  public async onCompleted(_job) {
    console.log('onCompleted', this.key, _job.data?.user?.id ?? _job.data)
  }
}
