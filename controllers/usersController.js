const User = require('../models/User') // data model
// for password encryption
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password').lean()

    if (!users?.length) {
        return res.status(400).json({ message: 'No Users found!' }) // 400 = bad request
    }

    res.json(users)
}

// @desc create new user
// @route POST /users
// @access Private
const createNewUser = async (req, res) => {

}

// @desc update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {

}

// @desc delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {

}

module.exports = {
    getAllUsers, 
    createNewUser, 
    updateUser, 
    deleteUser
}