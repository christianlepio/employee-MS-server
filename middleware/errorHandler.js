const { logEvents } = require('./logger')

// custom middleware
const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(`errorLog: ${err.stack}`)

    const status = res.statusCode ? res.statusCode : 500 // 500 is a server error

    res.status(status)

    res.json({ message: err.message, isError: true })
}

module.exports = errorHandler