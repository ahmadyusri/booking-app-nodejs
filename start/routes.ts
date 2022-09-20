/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', 'IndexController.index')

Route.post('/login', 'Auth/AuthController.login').as('login')
Route.post('/register', 'Auth/AuthController.register').as('register')

Route.group(() => {
  Route.group(() => {
    Route.get('/profile', 'Auth/UserController.profile').as('profile')
  })
    .prefix('/user')
    .as('user.')

  Route.post('/logout', 'Auth/AuthController.logout').as('logout')
}).middleware('auth')

/**
 *
 * Services Route
 *
 * */
Route.group(() => {
  /**
   *
   * Services Route
   *
   * */
  Route.resource('service', 'ServiceController').apiOnly()
  Route.group(() => {
    Route.put(':id/update-public', 'ServiceController.updatePublic').as('update-public')
    Route.put(':id/update-trending', 'ServiceController.updateTrending').as('update-trending')
    Route.post(':id/restore', 'ServiceController.restore').as('restore')
    Route.delete(':id/permanent', 'ServiceController.permanentDelete').as('permanent-delete')
  })
    .prefix('service')
    .as('service')

  /**
   *
   * Booking Route
   *
   * */
  Route.resource('booking', 'BookingController').only(['index', 'show', 'destroy']).apiOnly()
})
  .namespace('App/Controllers/Http/Service/Admin/')
  .prefix('/admin/service')
  .as('admin.service')
  .middleware('auth')

Route.group(() => {
  Route.resource('service', 'ServiceController').only(['index', 'show']).apiOnly()

  Route.group(() => {
    Route.resource('booking', 'BookingController').only(['index', 'show', 'destroy']).apiOnly()

    Route.group(() => {
      Route.post('/order', 'BookingController.order').as('order')
    })
      .prefix('booking')
      .as('booking')
  }).middleware('auth')
})
  .namespace('App/Controllers/Http/Service/LandingPage/')
  .prefix('service')
  .as('service')
  .middleware('silent_auth')

/**
 *
 * Article Route
 *
 * */
Route.group(() => {
  /**
   *
   * Article Category Route
   *
   * */
  Route.resource('category', 'ArticleCategoryController').apiOnly()

  /**
   *
   * Article Route
   *
   * */
  Route.resource('article', 'ArticleController').apiOnly()
  Route.group(() => {
    Route.put(':id/update-public', 'ArticleController.updatePublic').as('update-public')
    Route.put(':id/update-confirm', 'ArticleController.updateConfirm').as('update-confirm')
    Route.put(':id/update-trending', 'ArticleController.updateTrending').as('update-trending')
    Route.post(':id/restore', 'ArticleController.restore').as('restore')
    Route.delete(':id/permanent', 'ArticleController.permanentDelete').as('permanent-delete')
  })
    .prefix('article')
    .as('article')
})
  .namespace('App/Controllers/Http/Article/Admin/')
  .prefix('admin/article')
  .as('admin.article')
  .middleware('auth')

Route.resource('article', 'ArticleController')
  .namespace('App/Controllers/Http/Article/LandingPage/')
  .only(['index', 'show'])
  .apiOnly()
  .as('article')

Route.get('user/verification', () => {
  return {
    result: 'success',
    title: 'Redirect to FrontEnd Page or Change URL Verification to FrontEnd Page',
  }
})
Route.get('page/service/booking/:id', ({ params }) => {
  return {
    result: 'success',
    title: `Redirect to FrontEnd Page or Change URL Verification to FrontEnd Page, Booking ID : ${params.id}`,
  }
})
