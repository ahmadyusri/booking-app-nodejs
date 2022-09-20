import Mail from '@ioc:Adonis/Addons/Mail'
import EventStatus from 'App/Models/EventStatus'

Mail.monitorQueue(async (error): Promise<void> => {
  if (error) {
    // Update Event Status Database
    await EventStatus.updateOrCreate(
      {
        feature: error.mail.views.html?.data?.feature,
        data_id: error.mail.views.html?.data?.data_id,
        event_provider: 'mail',
      },
      {
        feature: error.mail?.views?.html?.data?.feature,
        data_id: error.mail?.views?.html?.data?.data_id,
        event_provider: 'mail',
        status: 'error',
        description: 'Failed Send Mail',
        response: error.message,
      }
    )
    return
  }
})
