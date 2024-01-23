require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const path = require('path')
// custom middleware
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')

const cookieParser = require('cookie-parser')
const cors = require('cors')
// configuration
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')

const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500

// connect to mongoDB
connectDB()

// use logger middleware from start of request
app.use(logger)

// implement 3rd party middleware
// Cross Origin Resource Sharing (CORS)
app.use(cors(corsOptions))

// ability to process JSON (built in middleware)
// this will let the app recieve and parse .json data
app.use(express.json())

// implement 3rd party middleware (cookie-parser)
app.use(cookieParser())

// listen for the root route ('/')
// serve static files such as css, images, etc.
// dirname here is the file path of this server.js
// express.static() is a built in middleware 
app.use('/', express.static(path.join(__dirname, 'public')))

// index route
// requesting for server index page
app.use('/', require('./routes/root'))

// route endpoint for requesting user
app.use('/users', require('./routes/userRoutes'))

// catch 404 page note found
app.all('*', (req, res) => {
    res.status(404) // set to 404

    if (req.accepts('html')) {
        // if the request header accepts html
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts()) {
        // if the request header accepts json data
        res.json({ message: '404 page not found!' })
    } else {
        res.type('txt').send('404 page not found!')
    }
})

// use error handler function here to log in error.log
app.use(errorHandler)

// listen for the connected event of mongoose
// listen for this event once
// listen for the event open, meaning if app success to connect to mongoDB
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')

    // listen to the app once mongoDB connection success
    // web creates a server that listens on port you define on your computer
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

// one other listener
// this will listen for an error with the mongoDB connection
mongoose.connection.on('error', err => {
    console.log('MongoDB connection error: ', err)

    // log the mongoDB connection error to file mongoErrLog.log
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
