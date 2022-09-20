import type { EventsList } from '@ioc:Adonis/Core/Event'
import EventStatus from 'App/Models/EventStatus'

export default class MailListener {
  public async onSent(event: EventsList['mail:sent']): Promise<void> {
    const { response } = event

    // Update Status
    const eventStatus = await EventStatus.query()
      .where('event_provider', 'mail')
      .where('event_id', response.messageId)
      .first()

    if (eventStatus) {
      eventStatus.merge({
        status: 'success',
        description: 'Mail Send to: ' + response.accepted.join(', '),
        response: response.response,
      })

      await eventStatus.save()
    }
  }
}
