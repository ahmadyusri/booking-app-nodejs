import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { appName } from 'Config/app'

export default class IndexController {
  index = async ({ i18n, response }: HttpContextContract) => {
    return response.status(200).send({
      app_name: appName,
      message: i18n.formatMessage('messages.welcome'),
    })
  }
}
