import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import I18n from '@ioc:Adonis/Addons/I18n'
import Bull, { Job } from '@ioc:Rocketseat/Bull'
import NewUserJob from 'App/Jobs/NewUserJob'
import Hash from '@ioc:Adonis/Core/Hash'
import { DateTime } from 'luxon'
import { v4 as uuid } from 'uuid'
import {
  AddUserProps,
  AddUserReturn,
  CreateAPITokenProps,
  EventNewUserProps,
  LoginProps,
  LoginReturn,
  LogoutProps,
} from 'App/Interfaces/AuthInterfaces'
import { OpaqueTokenContract } from '@ioc:Adonis/Addons/Auth'

export const addUser = async ({
  name,
  email,
  password,
  locale,
}: AddUserProps): Promise<AddUserReturn> => {
  const i18n = I18n.locale(locale ?? I18n.defaultLocale)
  const trx = await Database.transaction()

  try {
    const emailCheck = await User.query().where('email', email).first()
    if (emailCheck) {
      throw new Error(i18n.formatMessage('auth.E_EMAIL_EXISTS'))
    }

    const user = await User.create(
      {
        name: name,
        email: email,
        password: password,
      },
      { client: trx }
    )

    if (!user) {
      throw new Error(i18n.formatMessage('auth.E_FAILED_SAVED'))
    }

    await trx.commit()

    return {
      result: 'success',
      title: i18n.formatMessage('auth.REGISTER_SUCCESS'),
      status_code: 201,
      data: user,
    }
  } catch (error) {
    await trx.rollback()

    return {
      result: 'error',
      status_code: 401,
      title: error.message,
    }
  }
}

export const createAPIToken = async ({
  auth,
  user,
}: CreateAPITokenProps): Promise<OpaqueTokenContract<User>> => {
  // Generate token
  return await auth.use('api').generate(user)
}

export const eventNewUser = async ({ user, locale }: EventNewUserProps): Promise<Job> => {
  /*
   * Run Job
   * attempt 2 times on failed, every 1 minutes
   */
  const jobId = uuid()

  return await Bull.add(
    new NewUserJob().key,
    { user, locale },
    { jobId, attempts: 2, backoff: { type: 'fixed', delay: 60000 } }
  )
}

export const loginUser = async ({ password, email, locale }: LoginProps): Promise<LoginReturn> => {
  const i18n = I18n.locale(locale ?? I18n.defaultLocale)

  try {
    // Lookup user
    const user = await User.query().where('email', email).first()
    if (!user) {
      throw new Error(i18n.formatMessage('auth.E_INVALID_ACCOUNT_NOT_FOUND'))
    }

    // Verify password
    if (!(await Hash.verify(user.password, password))) {
      throw new Error(i18n.formatMessage('auth.E_INVALID_AUTH_PASSWORD'))
    }

    // Get Active API Token
    const apiTokens = await user
      .related('api_tokens')
      .query()
      .where((query) => {
        query.where('expires_at', '>', DateTime.now().toJSDate())
        query.orWhereNull('expires_at')
      })
      .orderBy('created_at', 'asc')

    if (apiTokens.length >= 3) {
      // Delete first API Token
      apiTokens[0].delete()
    }

    return {
      result: 'success',
      title: i18n.formatMessage('auth.LOGIN_SUCCESS'),
      status_code: 200,
      data: user,
    }
  } catch (error) {
    return {
      result: 'error',
      status_code: 401,
      title: error.message,
    }
  }
}

export const logoutUser = async ({ auth }: LogoutProps): Promise<void> => {
  // Logout
  await auth.use('api').revoke()
}
