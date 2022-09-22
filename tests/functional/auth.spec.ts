import I18n from '@ioc:Adonis/Addons/I18n'
import { test } from '@japa/runner'

const i18n = I18n.locale(I18n.defaultLocale)
const registerParams = {
  name: 'Test User from Route',
  email: 'testuserfromroute@gmail.com',
  password: 'testuserpassword',
}

test.group('auth route', (group) => {
  group.tap((tap) => tap.tags(['@auth', '@auth-routes']))

  let apiToken: string = ''

  test('register success', async ({ assert, client }) => {
    const response = await client.post('/register').form(registerParams)

    response.assertStatus(201)
    response.assertBodyContains({
      result: 'success',
      title: i18n.formatMessage('auth.REGISTER_SUCCESS'),
      data: {},
    })

    apiToken = response.body().data?.token

    assert.isString(apiToken)
  })

  test('register failed email exists', async ({ client }) => {
    const response = await client.post('/register').form(registerParams)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          field: 'email',
          rule: 'unique',
        },
      ],
    })
  })

  test('login success', async ({ assert, client }) => {
    const response = await client.post('/login').form({
      email: registerParams.email,
      password: registerParams.password,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      result: 'success',
      title: i18n.formatMessage('auth.LOGIN_SUCCESS'),
      data: {},
    })

    apiToken = response.body().data?.token

    assert.isString(apiToken)
  })

  test('login failed account not found', async ({ client }) => {
    const response = await client.post('/login').form({
      email: 'dummyemailfromroute@mail.com',
      password: registerParams.password,
    })

    response.assertStatus(401)
    response.assertBodyContains({
      result: 'error',
      title: i18n.formatMessage('auth.E_INVALID_ACCOUNT_NOT_FOUND'),
    })
  })

  test('login failed invalid password', async ({ client }) => {
    const response = await client.post('/login').form({
      email: registerParams.email,
      password: 'wrong_testuserpassword',
    })

    response.assertStatus(401)
    response.assertBodyContains({
      result: 'error',
      title: i18n.formatMessage('auth.E_INVALID_AUTH_PASSWORD'),
    })
  })

  test('logout success', async ({ client }) => {
    const response = await client.post('/logout').headers({
      Authorization: `Bearer ${apiToken}`,
    })

    response.assertStatus(200)
  })

  test('logout failed token deleted', async ({ client }) => {
    const response = await client.post('/logout').headers({
      Authorization: `Bearer ${apiToken}`,
    })

    response.assertStatus(401)
  })
})
