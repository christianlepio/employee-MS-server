const mongoose = require('mongoose')

// define user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    }, 
    password: {
        type: String,
        required: true
    }, 
    firstName: {
        type: String,
        required: true
    }, 
    lastName: {
        type: String,
        required: true
    }, 
    bdate: {
        type: Date,
        required: true
    }, 
    roles: {
        type: [String],
        default: ['Employee']
    }, 
    active: {
        type: Boolean,
        default: true
    }, 
    refreshToken: [String]
})

// create a model
// User is a singular and will find its equivalent plural form in the collections from mongoDB
module.exports = mongoose.model('User', userSchema)