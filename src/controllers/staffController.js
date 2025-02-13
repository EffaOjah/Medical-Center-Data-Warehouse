const path = require('path');
const bcrypt = require('bcrypt');

// Require database connection file
const connection = require('../db/connection');

// Require util
const util = require('util');

const query = util.promisify(connection.query).bind(connection);

// Admin dashboard
module.exports.staff_dashboard_get = async (req, res) => {
    try {
        // Get Patients
        const allPatients = await query('SELECT * FROM patients INNER JOIN users ON patients.user_id = users.user_id WHERE users.role = ?', 'patient');
        console.log('All patients: ', allPatients.length);

        // 
        res.render(path.join(__dirname, '../views/staff_dashboard'), { staff: req.user[0], allPatients });
    } catch (error) {
        console.log('Internal Server Error: ', error);
        res.render(path.join(__dirname, '../views/staff_dashboard'));
    }
};

// Patient details
module.exports.patient_details_get = async (req, res) => {
    const patientId = req.params.id;

    // Get patient details
    const patient = await query('SELECT * FROM patients INNER JOIN users ON patients.user_id = users.user_id WHERE patients.patient_id = ? AND users.role = ?', [patientId, 'patient']);

    console.log('Patient: ', patient);
    

    res.render(path.join(__dirname, '../views/patient_details'), { patient });
};

// Add medical record
module.exports.add_medical_record_post = async (req, res) => {
    const { patientId, diagnosis, treatmentPlan } = req.body;
    console.log(req.body);
 
    // Ensure that every detail was provided
    if (!patientId || !diagnosis || !treatmentPlan) {
        console.log('Incomplete details');
        return res.redirect('/staff/dashboard');
    }

    try {
        // Insert into the medical records table
        const insertRecord = query('INSERT INTO medical_records (patient_id, doctor, diagnosis, treatment_plan) VALUES (?, ?, ?, ?)', [patientId, req.user[0].full_name, diagnosis, treatmentPlan]);

        console.log('Successfully inserted record');
        return res.redirect('/staff/dashboard');
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.redirect('/staff/dashboard');
    }
};

// Add Treatment
module.exports.add_treatment_post = async (req, res) => {
    const { patientId, treatmentDescription, outcome } = req.body;
    console.log(req.body);
 
    // Ensure that every detail was provided
    if (!treatmentDescription || !outcome || !patientId) {
        console.log('Incomplete details');
        return res.redirect('/staff/dashboard');
    }

    try {
        // Insert into the medical records table
        const insertTreatment = query('INSERT INTO treatment_history (user_id, treatment_description, outcome) VALUES (?, ?, ?)', [patientId, treatmentDescription, outcome]);

        console.log('Successfully added treatment');
        return res.redirect('/staff/dashboard');
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.redirect('/staff/dashboard');
    }
};