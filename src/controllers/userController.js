const path = require('path');
const bcrypt = require('bcrypt');

// Require database connection file
const connection = require('../db/connection');

// Require util
const util = require('util');

const query = util.promisify(connection.query).bind(connection);

// Admin dashboard
module.exports.patient_dashboard_get = (req, res) => {
    res.render(path.join(__dirname, '../views/patient_dashboard'));
};