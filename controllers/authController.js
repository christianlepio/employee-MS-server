const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// @desc login 
// @route POST /auth 
// @access Public 
const login = async (req, res) => {
    const cookies = req.cookies
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required!' }) // 400 = bad request
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Username does not exist or is not active!' }) // 401 = unauthorized
    }

    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) return res.status(401).json({ message: 'Incorrect password!' }) // 401 = unauthorized

    const accessToken = jwt.sign(
        {
            'UserInfo': {
                'username': foundUser.username,
                'firstName': foundUser.firstName, 
                'lastName': foundUser.lastName, 
                'roles': foundUser.roles
            }
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '20s' }
    )

    const newRefreshToken = jwt.sign(
        { 'username': foundUser.username }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: '1d' }
    )

    let newRefreshTokenArray = !cookies?.jwt 
        ? foundUser.refreshToken 
        : foundUser.refreshToken.filter(rt => rt !== cookies.jwt)

    if (cookies?.jwt) {
        const refreshToken = cookies.jwt
        const foundToken = await User.findOne({ refreshToken }).exec()

        if (!foundToken) {
            newRefreshTokenArray = []
        }

        res.clearCookie('jwt', { 
            httpOnly: true, // accessible only by web server 
            secure: true, // https 
            sameSite: 'None', // cross-site cookie
            maxAge: 1 * 24 * 60 * 60 * 1000 // cookie expiry: set to match RT 
        })
    }

    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
    const result = await foundUser.save()

    res.cookie('jwt', newRefreshToken, {
        httpOnly: true, // accessible only by web server 
        secure: true, // https 
        sameSite: 'None', // cross-site cookie
        maxAge: 1 * 24 * 60 * 60 * 1000 // cookie expiry: set to match RT 
    })

    res.json({ accessToken })
}

// @desc get refesh token 
// @route GET /auth/refresh 
// @access Public - because access token has expiration
// this function will issued new access token if the refresh token still not expired
const refresh = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized!' }) // 401 = unauthorized

    const refreshToken = cookies.jwt

    res.clearCookie('jwt', { 
        httpOnly: true, // accessible only by web server 
        secure: true, // https 
        sameSite: 'None', // cross-site cookie
        maxAge: 1 * 24 * 60 * 60 * 1000 // cookie expiry: set to match RT 
    })

    const foundUser = await User.findOne({ refreshToken }).exec()

    if (!foundUser) {
        jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_SECRET, 
            async (err, decoded) => {
                if (err) {
                    return res.sendStatus(403) // 403 = forbidden
                } else {
                    const hackedUser = await User.findOne({ username: decoded.username }).exec()
                    const newRefreshTokenArray = hackedUser.refreshToken.filter(rt => rt !== refreshToken)
                    hackedUser.refreshToken = [...newRefreshTokenArray]
                    const saveResult = await hackedUser.save()

                    return res.sendStatus(403) // 403 = forbidden
                }
            }
        )
    } else {
        const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken)

        jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_SECRET, 
            async (err, decoded) => {
                if (err) {
                    foundUser.refreshToken = [...newRefreshTokenArray]
                    const result = await foundUser.save()
                } 

                if (err || foundUser.username !== decoded.username) {
                    return res.status(403).json({ message: 'Forbidden!' }) // 403 = forbidden
                } else {

                }
    
                const accessToken = jwt.sign(
                    {
                        'UserInfo': {
                            'username': foundUser.username,
                            'firstName': foundUser.firstName, 
                            'lastName': foundUser.lastName, 
                            'roles': foundUser.roles
                        }
                    }, 
                    process.env.ACCESS_TOKEN_SECRET, 
                    { expiresIn: '20s' }
                )

                const newRefreshToken = jwt.sign(
                    { 'username': foundUser.username }, 
                    process.env.REFRESH_TOKEN_SECRET, 
                    { expiresIn: '1d' }
                )

                foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]

                const result = await foundUser.save()

                res.cookie('jwt', newRefreshToken, {
                    httpOnly: true, // accessible only by web server 
                    secure: true, // https 
                    sameSite: 'None', // cross-site cookie
                    maxAge: 1 * 24 * 60 * 60 * 1000 // cookie expiry: set to match RT 
                })
    
                res.json({ accessToken })
            }
        )
    }
}

// @desc logout
// @route POST /auth/logout 
// @access Public - clear cookie if exists
const logout = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.sendStatus(204) // success but no content

    const refreshToken = cookies.jwt

    const foundUser = await User.findOne({ refreshToken }).exec()

    if (!foundUser) {
        res.clearCookie('jwt', { 
            httpOnly: true, // accessible only by web server 
            secure: true, // https 
            sameSite: 'None', // cross-site cookie
            maxAge: 1 * 24 * 60 * 60 * 1000 // cookie expiry: set to match RT 
        })

        return res.sendStatus(204) // success but no content
    } else {
        foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken)

        const result = await foundUser.save()

        res.clearCookie('jwt', { 
            httpOnly: true, // accessible only by web server 
            secure: true, // https 
            sameSite: 'None', // cross-site cookie
            maxAge: 1 * 24 * 60 * 60 * 1000 // cookie expiry: set to match RT 
        })
    
        res.json({ message: 'Logout success!' })
    }
}

module.exports = {
    login, 
    refresh, 
    logout 
}