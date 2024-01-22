const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimitter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 login requests per 'window' per minute
    message: { message: 'Too many login attempts from this IP, please try again after a minute pause' }, 
    // if login attempt limit has achieved then log the error message to errLog.log file 
    handler: (req, res, next, options) => {
        logEvents(`Too many login attempts: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    // recommended options 
    standardHeaders: true, // return rate limit info in the 'RateLimit-*' headers
    legacyHeaders: false, // disable the 'X-RateLimit-*' headers
})

module.exports = loginLimitter