import { test } from '@japa/runner'
import I18n from '@ioc:Adonis/Addons/I18n'
import User from 'App/Models/User'
import { eventNewUser } from 'App/Services/AuthService'
import NewUserJob from 'App/Jobs/NewUserJob'

const i18n = I18n.locale(I18n.defaultLocale)
const registerParams = {
  name: 'Test User from Queue',
  email: 'testuserfromqueue@gmail.com',
  password: 'testuserpassword',
}

test.group('queue', (group) => {
  group.tap((tap) => tap.tags(['@queue']))

  test('should add a new job', async ({ client, assert }) => {
    const responseRegister = await client.post('/register').form(registerParams)

    responseRegister.assertStatus(201)
    responseRegister.assertBodyContains({
      result: 'success',
      title: i18n.formatMessage('auth.REGISTER_SUCCESS'),
      data: {},
    })

    const apiToken = responseRegister.body().data?.token
    assert.isString(apiToken)

    const responseProfile = await client.get('/user/profile').headers({
      Authorization: `Bearer ${apiToken}`,
    })

    responseProfile.assertStatus(200)
    responseProfile.assertBodyContains({
      result: 'success',
      data: {},
    })

    const userId = responseProfile.body().data?.id
    const user = await User.find(userId)
    assert.instanceOf(user, User)

    if (!user) {
      assert.fail('User not found')
      return
    }

    const job = await eventNewUser({ user })
    assert.equal(new NewUserJob().key, job.name)
  })
})
