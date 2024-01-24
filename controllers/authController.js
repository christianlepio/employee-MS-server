const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// @desc login 
// @route POST /auth 
// @access Public 
const login = async (req, res) => {

}

// @desc get refesh token 
// @route GET /auth/refresh 
// @access Public - because access token has expiration
// this function will issued new access token if the refresh token still not expired
const refresh = async (req, res) => {

}

// @desc logout
// @route POST /auth/logout 
// @access Public - clear cookie if exists
const logout = async (req, res) => {

}

module.exports = {
    login, 
    refresh, 
    logout 
}