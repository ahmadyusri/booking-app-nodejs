import Redis from '@ioc:Adonis/Addons/Redis'
import type { EventsList } from '@ioc:Adonis/Core/Event'

export default class MailListener {
  public async onSent(event: EventsList['mail:sent']): Promise<void> {
    const { response, message } = event

    // Start Listener Job Response
    await Redis.publish(
      'jobs-response',
      JSON.stringify({
        jobId: message.messageId,
        status: 'success',
        data: {
          description: 'Mail Send to: ' + response.accepted.join(', '),
          response: response.response,
        },
      })
    )
  }
}
