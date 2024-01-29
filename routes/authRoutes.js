const express = require('express')
const router = express.Router()
// controller
const authController = require('../controllers/authController')
// custom middleware
const loginLimitter = require('../middleware/loginLimitter')

// root/index route of '/auth' route
router.route('/')
    .post(loginLimitter, authController.login) // login function controller

// route to get request for refresh token of '/auth' route
router.route('/refresh')
    .get(authController.refresh)

// route to logout of '/auth' route
router.route('/logout')
    .get(authController.logout)

module.exports = router