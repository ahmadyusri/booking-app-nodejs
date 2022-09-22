import Mail from '@ioc:Adonis/Addons/Mail'
import Redis from '@ioc:Adonis/Addons/Redis'

Mail.monitorQueue(async (error): Promise<void> => {
  if (error) {
    const viewsData = error.mail.views.html?.data
    const eventId = viewsData?.event?.id
    const eventProvider = viewsData?.event?.provider

    if (!eventId) {
      return
    }

    const data = {
      description: 'Failed Send Mail',
      response: error.message,
    }

    if (eventProvider) {
      data['event_provider'] = eventProvider
    }

    // Start Listener Job Response
    await Redis.publish(
      'jobs-response',
      JSON.stringify({
        jobId: eventId,
        status: 'error',
        data: data,
      })
    )
    return
  }
})
