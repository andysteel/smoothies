const User = require('../models/User');
const { appLogger } = require('../logs/ApplicationLog');
const jwt = require('jsonwebtoken');

const handleErrors = (error) => {
    appLogger.log('error', error.message);
    let errors = {email: '', password: ''};

    if(error.message === 'incorrect email') {
        errors.email = 'the email is incorrect';
    }

    if(error.message === 'incorrect password') {
        errors.password = 'the password is incorrect';
    }

    if(error.code === 11000) {
        errors.email = 'The Email is already registered';
        return errors;
    }

    //validation errors
    if(error.message.includes('user validation failed')) {
        Object.values(error.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}

const maxAge = 1 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.APP_SECRET, {
        expiresIn: maxAge,
        algorithm: "HS512",
        encoding: 'UTF-8',        
    });
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        appLogger.log('info', `credenciais: ${email} - ${password}`);
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('SESSIONID', token, { httpOnly: true, maxAge: maxAge * 1000, sameSite: true });
        res.status(201).json({ email });
    } catch(error) {
        const errors = handleErrors(error); 
        res.status(400).json({errors});
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('SESSIONID', token, { httpOnly: true, maxAge: maxAge * 1000, sameSite: true });
        res.status(200).json({user: user._id});
    } catch(err) {
        const errors = handleErrors(err);
        res.status(401).json({ errors });
    }
}

module.exports.logout_get = async (req, res) => {
    res.cookie('SESSIONID', '', { maxAge: 1 });
    res.redirect('/');
}