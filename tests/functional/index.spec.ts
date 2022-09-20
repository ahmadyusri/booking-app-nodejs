import { test } from '@japa/runner'
import { appName } from 'Config/app'

test('display index page', async ({ client }) => {
  const response = await client.get('/')

  response.assertStatus(200)
  response.assertBodyContains({ app_name: appName })
})
