import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateUserValidator from 'App/Validators/Auth/CreateUserValidator'
import LoginUserValidator from 'App/Validators/Auth/LoginUserValidator'
import {
  addUser,
  createAPIToken,
  eventNewUser,
  loginUser,
  logoutUser,
} from 'App/Services/AuthService'

export default class AuthController {
  public login = async ({ i18n, auth, request, response }: HttpContextContract) => {
    /**
     * Validate request body against the schema
     */
    await request.validate(LoginUserValidator)

    const { email, password } = request.body()

    const loginService = await loginUser({
      email,
      password,
      locale: i18n.locale,
    })

    const statusCode = loginService.status_code

    if (loginService.result !== 'success') {
      return response.status(statusCode).send({
        result: loginService.result,
        title: loginService.title,
        data: loginService?.data,
      })
    }

    const user = loginService.data
    if (!user) {
      return response.status(200).send({
        result: 'error',
        title: i18n.formatMessage('auth.E_FAILED_GET_DATA'),
      })
    }

    // Generate token
    const token = await createAPIToken({ user, auth })

    return response.status(statusCode).send({
      result: loginService.result,
      title: loginService.title,
      data: token.toJSON(),
    })
  }

  public register = async ({ i18n, auth, request, response }: HttpContextContract) => {
    /**
     * Validate request body against the schema
     */
    await request.validate(CreateUserValidator)

    const { name, email, password } = request.body()

    const addUserService = await addUser({
      name,
      email,
      password,
      locale: i18n.locale,
    })

    const statusCode = addUserService.status_code

    if (addUserService.result !== 'success') {
      return response.status(statusCode).send({
        result: addUserService.result,
        title: addUserService.title,
        data: addUserService?.data,
      })
    }

    const user = addUserService.data
    if (!user) {
      return response.status(statusCode).send({
        result: 'error',
        title: i18n.formatMessage('auth.E_FAILED_SAVED'),
      })
    }

    // Generate token
    const token = await createAPIToken({ user, auth })

    // Emit Event
    eventNewUser({ user, locale: i18n.locale })

    return response.status(statusCode).send({
      result: addUserService.result,
      title: addUserService.title,
      data: token.toJSON(),
    })
  }

  public logout = async ({ i18n, auth, response }: HttpContextContract) => {
    await logoutUser({ auth })

    return response.status(200).send({
      result: 'success',
      title: i18n.formatMessage('auth.LOGOUT_SUCCESS'),
    })
  }
}
