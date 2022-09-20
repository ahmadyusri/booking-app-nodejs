/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

import Redis from '@ioc:Adonis/Addons/Redis'
import EventStatus from 'App/Models/EventStatus'

Redis.subscribe('jobs-response', async (response: string) => {
  let jobResponse: any = null
  try {
    jobResponse = JSON.parse(response)
  } catch {}

  if (!jobResponse) {
    return
  }

  const jobId = jobResponse.jobId
  if (!jobId) {
    return
  }

  const updateData = {}

  if (jobResponse?.status) {
    updateData['status'] = jobResponse?.status
  }
  if (jobResponse?.data?.event_provider) {
    updateData['event_provider'] = jobResponse?.data?.event_provider
  }
  if (jobResponse?.data?.description) {
    updateData['description'] = jobResponse?.data?.description
  }
  if (jobResponse?.data?.response) {
    updateData['response'] = jobResponse?.data?.response
  }

  if (Object.keys(updateData).length !== 0) {
    const eventStatus = await EventStatus.query().where('event_id', jobId).first()
    if (eventStatus) {
      eventStatus.merge(updateData)
      eventStatus.save()
    }
  }
})
