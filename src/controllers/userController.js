const path = require('path');
const bcrypt = require('bcrypt');

// Require database connection file
const connection = require('../db/connection');

// Require util
const util = require('util');

const query = util.promisify(connection.query).bind(connection);

// Admin dashboard
module.exports.patient_dashboard_get = async (req, res) => {
    try {
        // Get the patient's details
        const patient = await query('SELECT * FROM users INNER JOIN patients ON users.user_id = patients.user_id WHERE users.user_id = ?', req.user[0].user_id);
        console.log('Patient Details: ', patient);

        // Get the patient's medical records
        const records = await query('SELECT * FROM medical_records WHERE patient_id = ?', patient[0].patient_id);
        console.log('Patient Record: ', records);
        
        // Get the patient's treatment history
        const treatmentHistory = await query('SELECT * FROM treatment_history WHERE user_id = ?',  patient[0].patient_id);
        console.log('Patient Treatment History: ', treatmentHistory);
        
        res.render(path.join(__dirname, '../views/patient_dashboard'), { patient, records, treatmentHistory });
    } catch (error) {
        console.log('Internal Server Error: ', error);
        res.redirect('/login/patient');
    }
};