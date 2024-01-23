const express = require('express')
const router = express.Router()

// controller
const usersController = require('../controllers/usersController')
// middleware
const verifyJWT = require('../middleware/verifyJWT')

// check if access token exist and not expired before performing controllers below
router.use(verifyJWT)

// this is the index route of '/users' route
router.route('/')
    .get(usersController.getAllUsers) // read all users
    .post(usersController.createNewUser) // create new user
    .patch(usersController.updateUser) // update user
    .delete(usersController.deleteUser) // delete user

module.exports = router