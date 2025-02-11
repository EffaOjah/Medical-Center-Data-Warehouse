require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;

// Require database connection file
const connection = require('../db/connection');

// Require util
const util = require('util');

const query = util.promisify(connection.query).bind(connection);

// Middleware to verify jwt token for the admin
module.exports.verifyAdminToken = (req, res, next) => {
    let token = req.cookies['AdminToken'];

    // Check if token exists
    if (!token) {
        console.log('Token is not provided');
        
        // Redirect to the admin login route
        return res.redirect('/login/admin');
    }

    // If token is provided, verify it
    jwt.verify(token, secret, async (err, decoded) => {
        if (err) {
            console.log('Invalid token');

            // Redirect to the admin login route
            return res.redirect('/login/admin');
        }

        // Get the user's details
        const user = await query('SELECT * FROM users WHERE user_id = ?', decoded.userId);

        req.user = user;
        console.log('req.user(User): ', user);
        
        next();
    });
}

// Middleware to verify jwt token for the staff
module.exports.verifyStaffToken = (req, res, next) => {
    let token = req.cookies['StaffToken'];

    // Check if token exists
    if (!token) {
        console.log('Token is not provided');
        
        // Redirect to the staff login route
        return res.redirect('/login/staff');
    }

    // If token is provided, verify it
    jwt.verify(token, secret, async (err, decoded) => {
        if (err) {
            console.log('Invalid token');

            // Redirect to the staff login route
            return res.redirect('/login/staff');
        }

        // Get the user's details
        const user = await query('SELECT * FROM users WHERE user_id = ?', decoded.userId);

        req.user = user;
        console.log('req.user(User): ', user);
        
        next();
    });
}

// Middleware to verify jwt token for the user
module.exports.verifyUserToken = (req, res, next) => {
    let token = req.cookies['UserToken'];

    // Check if token exists
    if (!token) {
        console.log('Token is not provided');
        
        // Redirect to the user login route
        return res.redirect('/login/user');
    }

    // If token is provided, verify it
    jwt.verify(token, secret, async (err, decoded) => {
        if (err) {
            console.log('Invalid token');

            // Redirect to the user login route
            return res.redirect('/login/user');
        }

        // Get the user's details
        const user = await query('SELECT * FROM users WHERE user_id = ?', decoded.userId);

        req.user = user;
        console.log('req.user(User): ', user);
        
        next();
    });
}