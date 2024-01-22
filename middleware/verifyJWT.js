const jwt = require('jsonwebtoken')

// custom middleware
const verifyJWT = (req, res, next) => {
    // get auth header access token that starts with 'Bearer '
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized!' }) // 401 = unauthorized status
    }

    // get access token after the word 'Bearer '
    const token = authHeader.split(' ')[1]

    // check if access token still not expired using jwt verify method
    jwt.verify(
        token, 
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            // error on jwt verification
            if (err) return res.status(403).json({ message: 'Forbidden!' }) // 403 = forbidden status

            // get username & roles from decoded data 
            req.user = decoded.UserInfo.username
            req.roles = decoded.UserInfo.roles

            // this will allow to move on the next middleware or controller
            next()
        }
    )
}

module.exports = verifyJWT