const path = require('path');
const bcrypt = require('bcrypt');

// Require database connection file
const connection = require('../db/connection');

// Require util
const util = require('util');

const query = util.promisify(connection.query).bind(connection);

const jwt = require('../jwt/jwtSign');

// Get the login page
module.exports.login_get = (req, res) => {
    let role = req.params.role;

    res.render(path.join(__dirname, '../views/login'), { role });
};



// Operation for post routes
// Admin login
module.exports.admin_login_post = async (req, res) => {
    const { email, password, role } = req.body;
    console.log(req.body);

    try {
        // Check if user exists
        const checkUser = await query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
        console.log(checkUser);

        if (checkUser.length < 1) {
            console.log('User not found');
            return res.redirect(`/login/${role}`);
        }

        const user = checkUser[0];

        // Compare passwords
        if (password !== user.password) {
            console.log('Incorrect password');
            return res.redirect(`/login/${role}`);
        }
        console.log('Password is correct');

        // Now authenticate the user
        // Generate the jwtToken for the admin
        const adminToken = await jwt.generateJwtToken(user.user_id);
        console.log('AdmintToken: ', adminToken);

        // Set cookie
        res.cookie('AdminToken', adminToken, { maxAge: 60 * 60 * 24 * 365 }); // Cookie expires in one year

        // Redirect to the admin dashboard
        res.redirect(`/admin/dashboard`);
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.redirect(`/login/${role}`);
    }
};

// Staff login
module.exports.staff_login_post = async (req, res) => {
    const { email, password, role } = req.body;
    console.log(req.body);

    try {
        // Check if user exists
        const checkUser = await query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
        console.log(checkUser);

        if (checkUser.length < 1) {
            console.log('User not found');
            return res.redirect(`/login/${role}`);
        }

        const user = checkUser[0];

        // Compare passwords
        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
            console.log('Incorrect password');
            return res.redirect(`/login/${role}`);
        }

        console.log('Password is correct');

        // Now authenticate the user
        // Generate the jwtToken for the admin
        const staffToken = await jwt.generateJwtToken(user.user_id);
        console.log('StaffToken: ', staffToken);

        // Set cookie
        res.cookie('StaffToken', staffToken, { maxAge: 60 * 60 * 24 * 365 }); // Cookie expires in one year

        // Redirect to the admin dashboard
        res.redirect(`/staff/dashboard`);
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.redirect(`/login/${role}`);
    }
};

// Patient login
module.exports.patient_login_post = async (req, res) => {
    const { email, password, role } = req.body;
    console.log(req.body);

    try {
        // Check if user exists
        const checkUser = await query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
        console.log(checkUser);

        if (checkUser.length < 1) {
            console.log('User not found');
            return res.redirect(`/login/${role}`);
        }

        const user = checkUser[0];

        // Compare passwords
        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
            console.log('Incorrect password');
            return res.redirect(`/login/${role}`);
        }

        console.log('Password is correct');

        // Now authenticate the user
        // Generate the jwtToken for the admin
        const userToken = await jwt.generateJwtToken(user.user_id);
        console.log('UserToken: ', userToken);

        // Set cookie
        res.cookie('UserToken', userToken, { maxAge: 60 * 60 * 24 * 365 }); // Cookie expires in one year

        // Redirect to the admin dashboard
        res.redirect(`/user/dashboard`);
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.redirect(`/login/${role}`);
    }
};