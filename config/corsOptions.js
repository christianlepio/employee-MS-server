const allowedOrigins = require('./allowedOrigins')

// this is a 3rd party middleware that will attched to cors middleware in server js
const corsOptions = {
    // origin method that receives origin and callback function
    // origin parameter here coming from who ever requested it like google.com
    origin: (origin, callback) => {
        // if the origin is in the list of allowed origins array
        // !origin means it allows postman to access the REST API
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            // null here means there's no error, true means that the origin will sent back and that is allowed
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }, 
    credentials: true, // this sets the Access-Control-Allow-Credentials header, will automatically handles that header
    optionsSuccessStatus: 200 // set this to '200' b'coz some other devices having issues with the default '204'
}

module.exports = corsOptions