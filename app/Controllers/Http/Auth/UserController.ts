import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserController {
  public profile = async ({ auth, response }: HttpContextContract) => {
    const userData = auth.user

    if (!userData) {
      return response.status(200).send({
        result: 'error',
        title: 'Failed Get Profile Data',
      })
    }

    return response.status(200).send({
      result: 'success',
      title: 'Success Get Profile Data',
      data: userData.serialize(),
    })
  }
}
