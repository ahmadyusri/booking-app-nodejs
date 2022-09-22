import { test } from '@japa/runner'
import { appName } from 'Config/app'

test.group('index route', (group) => {
  group.tap((tap) => tap.tags(['@index', '@index-routes']))

  test('display index page', async ({ client }) => {
    const response = await client.get('/')

    response.assertStatus(200)
    response.assertBodyContains({ app_name: appName })
  })

  test('health status', async ({ client }) => {
    const response = await client.get('/health')

    response.assertStatus(200)
    response.assertBodyContains({ healthy: true })
  })
})
