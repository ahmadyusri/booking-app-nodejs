import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import I18n from '@ioc:Adonis/Addons/I18n'
import Bull from '@ioc:Rocketseat/Bull'
import NewUserJob from 'App/Jobs/NewUserJob'
import Hash from '@ioc:Adonis/Core/Hash'
import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import { DateTime } from 'luxon'

export interface AddUserProps {
  name: string
  email: string
  password: string
  locale?: string
}

export interface AddUserReturn {
  result: string
  title: string
  status_code: number
  data?: any
}

export const addUser = async ({
  name,
  email,
  password,
  locale,
}: AddUserProps): Promise<AddUserReturn> => {
  const i18n = I18n.locale(locale ?? I18n.defaultLocale)

  const trx = await Database.transaction()

  try {
    const user = await User.create(
      {
        name: name,
        email: email,
        password: password,
      },
      { client: trx }
    )

    if (!user) {
      return {
        result: 'error',
        status_code: 200,
        title: i18n.formatMessage('auth.E_FAILED_SAVED'),
      }
    }

    trx.commit()

    return {
      result: 'success',
      title: i18n.formatMessage('auth.REGISTER_SUCCESS'),
      status_code: 200,
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

export interface CreateAPITokenProps {
  auth: AuthContract
  user: User
}

export const createAPIToken = async ({ auth, user }: CreateAPITokenProps): Promise<object> => {
  // Generate token
  return (await auth.use('api').generate(user)).toJSON()
}

export interface EmitEventNewUserProps {
  user: User
  locale?: string
}

export const emitEventNewUser = ({ user, locale }: EmitEventNewUserProps): void => {
  // Run Job
  Bull.add(new NewUserJob().key, { user, locale })
}

export interface LoginUserProps {
  email: string
  password: string
  locale?: string
}

export interface LoginUserReturn {
  result: string
  title: string
  status_code: number
  data?: any
}

export const loginUser = async ({
  password,
  email,
  locale,
}: LoginUserProps): Promise<LoginUserReturn> => {
  const i18n = I18n.locale(locale ?? I18n.defaultLocale)

  try {
    // Lookup user
    const user = await User.query().where('email', email).first()
    if (!user) {
      return {
        result: 'error',
        status_code: 200,
        title: i18n.formatMessage('auth.E_INVALID_ACCOUNT_NOT_FOUND'),
      }
    }

    // Verify password
    if (!(await Hash.verify(user.password, password))) {
      throw new Error(i18n.formatMessage('auth.E_INVALID_AUTH_PASSWORD'))
    }

    // Get Active API Token
    const api_tokens = await user
      .related('api_tokens')
      .query()
      .where((query) => {
        query.where('expires_at', '>', DateTime.now().toJSDate())
        query.orWhereNull('expires_at')
      })
      .orderBy('created_at', 'asc')

    if (api_tokens.length >= 3) {
      // Delete first API Token
      api_tokens[0].delete()
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

export interface LogoutUserProps {
  auth: AuthContract
}

export const logoutUser = async ({ auth }: LogoutUserProps): Promise<void> => {
  // Logout
  await auth.use('api').revoke()
}
