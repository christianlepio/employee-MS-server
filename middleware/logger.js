const { format } = require('date-fns')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, logFilename) => {
    const dateTime = format(new Date(), 'yyyMMdd\tHH:mm:ss')
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try {
        // directory does not exist
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            // make 'logs' folder dir
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        } else {
            // append logItem to logFilename
            await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFilename), logItem)
        }
    } catch (err) {
        console.log('logEvents error: ', err)
    }
}

// custom middleware
const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')

    // this will move on to the next piece of middleware or probably to the controller
    next()
}

module.exports = { logEvents, logger }