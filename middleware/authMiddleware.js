const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
    const token = req.cookies.SESSIONID;

    if(token) {
        jwt.verify(token, process.env.APP_SECRET, (error, decodedToken) => {
            if(error) {
                res.redirect('/login');
            } else {
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.SESSIONID;

    if(token) {
        jwt.verify(token, process.env.APP_SECRET, async (error, decodedToken) => {
            if(error) {
                res.locals.user = null;
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };