import HealthCheck from '@ioc:Adonis/Core/HealthCheck'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { appName } from 'Config/app'

export default class IndexController {
  public index = async ({ i18n, response }: HttpContextContract) => {
    return response.status(200).send({
      app_name: appName,
      message: i18n.formatMessage('messages.welcome'),
    })
  }

  public health = async ({ response }: HttpContextContract) => {
    const report = await HealthCheck.getReport()

    return report.healthy ? response.ok(report) : response.badRequest(report)
  }
}
