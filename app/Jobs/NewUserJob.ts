import { Job, JobContract, QueueOptions, WorkerOptions } from '@ioc:Rocketseat/Bull'
import User from 'App/Models/User'
import NewUserMailer from 'App/Mailers/NewUserMailer'
import EventStatus from 'App/Models/EventStatus'
import { appUrl } from 'Config/app'

/*
|--------------------------------------------------------------------------
| Job setup
|--------------------------------------------------------------------------
|
*/

export interface NewUserJobProps extends Job {
  data: {
    user: User
    locale: string
  }
}

import Env from '@ioc:Adonis/Core/Env'
const prefix = Env.get('BULL_PREFIX')

export default class NewUserJob implements JobContract {
  public key = 'NewUserJob'
  public feature: string = 'new_user'

  private event_id: string
  private data_id: number

  public queueOptions: QueueOptions = {
    prefix,
  }

  public workerOptions: WorkerOptions = {
    prefix,
  }

  public async handle(job: NewUserJobProps) {
    const { data } = job
    const { user, locale } = data

    this.data_id = user.id
    this.event_id = String(job.id)

    let verification_pageurl: string = appUrl + '/user/verification'

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

    await new NewUserMailer(user, {
      locale: locale,
      verification_pageurl: verification_pageurl,
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
