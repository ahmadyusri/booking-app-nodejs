import Mail from '@ioc:Adonis/Addons/Mail'
import Redis from '@ioc:Adonis/Addons/Redis'

Mail.monitorQueue(async (error): Promise<void> => {
  if (error) {
    const views_data = error.mail.views.html?.data
    const event_id = views_data?.event?.id
    const event_provider = views_data?.event?.provider

    if (!event_id) {
      return
    }

    const data = {
      description: 'Failed Send Mail',
      response: error.message,
    }

    if (event_provider) {
      data['event_provider'] = event_provider
    }

    // Start Listener Job Response
    await Redis.publish(
      'jobs-response',
      JSON.stringify({
        jobId: event_id,
        status: 'error',
        data: data,
      })
    )
    return
  }
})
