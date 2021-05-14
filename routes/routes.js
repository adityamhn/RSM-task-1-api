const router = require('express').Router()
var express = require('express')
const { verifySignUp } = require('../middlewares')
const controller = require('../controllers/auth.controllers')


router.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    )
    next()
  })

  router.post(
    '/signup',
    [verifySignUp.checkDuplicateEmail],
    controller.signup,
  )

  router.post('/signin', controller.signin)

  router.get('/verifyEmail/:token/:userId' ,controller.verifyEmail)

  router.post('/forgetPassword',controller.forgetPassword)

  router.get('/forgetPassword/verifyLink/:resetToken/:userId',controller.verifyLink)

  router.post('/forgetPassword/verifyLink/:resetToken/:userId',controller.resetPassword)


module.exports = router
