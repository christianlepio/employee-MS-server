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
    const { username, password, firstName, lastName, bdate, roles } = req.body

    if (!username || !password || !firstName || !lastName || !bdate) {
        return res.status(400).json({ message: 'All fields are required!' }) // 400 = bad request
    }

    const duplicatedUser = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if (duplicatedUser) {
        return res.status(409).json({ message: 'Username already exist!' }) // 409 = conflict
    }

    const hashedPwd = await bcrypt.hash(password, 10) // 10 is a default salt rounds for password hashing

    const userRolesObj = (!Array.isArray(roles) || !roles.length)
        ? { username, 'password': hashedPwd, firstName, lastName, bdate }
        : { username, 'password': hashedPwd, firstName, lastName, bdate, roles }

    // create and store new user to the database (mongoDB)
    const user = await User.create(userRolesObj)

    if (user) { // user was successfully created
        res.status(201).json({ message: `New user ${username} created!` }) // 201 = created
    } else {
        res.status(400).json({ message: 'Invalid received user data!' }) // 400 = bad request
    }
}

// @desc update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
    const { id, username, password, firstName, lastName, bdate, roles, active } = req.body

    if (!id || !username || !firstName || !lastName || !bdate || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required!' }) // 400 = bad request
    }

    // find user by id, exec() method means it will attach other methods to the response document such as save() method
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'No users found!' }) // 400 = bad request
    }

    const duplicatedUser = await User.findOne({ username }).collation({locale: 'en', strength: 2}).lean().exec()

    if (duplicatedUser && duplicatedUser?._id.toString() !== id) {
        return res.status(409).json({ message: 'Username already exist!' }) // 409 = conflict
    }

    user.username = username
    user.firstName = firstName
    user.lastName = lastName
    user.bdate = bdate
    user.roles = roles 
    user.active = active

    if (password) {
        user.password = await bcrypt.hash(password, 10) // 10 is a default salt rounds for password hashing
    }

    const updatedUser = await user.save()

    res.json({ message: `User ${updatedUser.username} updated!` })
}

// @desc delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Id property is missing!' }) // 400 = bad request
    }

    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ message: 'User does not exist in the database!' }) // 400 = bad request
    }

    const result = await user.deleteOne()

    const reply = `Username: ${user.username} with ID: ${user._id} has been deleted!`

    res.json(reply)
}

module.exports = {
    getAllUsers, 
    createNewUser, 
    updateUser, 
    deleteUser
}