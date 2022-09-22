import { test } from '@japa/runner'
import { addUser, loginUser } from 'App/Services/AuthService'
import { AddUserProps } from 'App/Interfaces/AuthInterfaces'
import User from 'App/Models/User'
import I18n from '@ioc:Adonis/Addons/I18n'

const i18n = I18n.locale(I18n.defaultLocale)
const addUserProps: AddUserProps = {
  name: 'Test User from Service',
  email: 'testuserfromservice@gmail.com',
  password: 'testuserfromservicepassword',
  locale: i18n.locale,
}

test.group('auth services', (group) => {
  group.tap((tap) => tap.tags(['@auth', '@auth-service']))

  test('service add user success', async ({ assert }) => {
    const processAddUser = await addUser(addUserProps)

    assert.isObject(processAddUser)
    assert.containsSubset(processAddUser, {
      result: 'success',
      status_code: 201,
      title: i18n.formatMessage('auth.REGISTER_SUCCESS'),
    })
  })

  test('service add user same email failed email exists', async ({ assert }) => {
    const processAddUser = await addUser(addUserProps)

    assert.isObject(processAddUser)
    assert.containsSubset(processAddUser, {
      result: 'error',
      status_code: 401,
      title: i18n.formatMessage('auth.E_EMAIL_EXISTS'),
    })
  })

  test('service login user success', async ({ assert }) => {
    const processLoginUser = await loginUser({
      email: addUserProps.email,
      password: addUserProps.password,
      locale: i18n.locale,
    })

    assert.isObject(processLoginUser)
    assert.containsSubset(processLoginUser, {
      result: 'success',
      title: i18n.formatMessage('auth.LOGIN_SUCCESS'),
      status_code: 200,
    })
    assert.instanceOf(processLoginUser.data, User)
  })

  test('service login user failed account not found', async ({ assert }) => {
    const processLoginUser = await loginUser({
      email: 'dummyemailfromservice@mail.com',
      password: addUserProps.password,
      locale: i18n.locale,
    })

    assert.isObject(processLoginUser)
    assert.containsSubset(processLoginUser, {
      result: 'error',
      status_code: 401,
      title: i18n.formatMessage('auth.E_INVALID_ACCOUNT_NOT_FOUND'),
    })
  })

  test('service login user failed invalid password', async ({ assert }) => {
    const processLoginUser = await loginUser({
      email: addUserProps.email,
      password: 'wrong_testuserpassword',
      locale: i18n.locale,
    })

    assert.isObject(processLoginUser)
    assert.containsSubset(processLoginUser, {
      result: 'error',
      status_code: 401,
      title: i18n.formatMessage('auth.E_INVALID_AUTH_PASSWORD'),
    })
  })
})
