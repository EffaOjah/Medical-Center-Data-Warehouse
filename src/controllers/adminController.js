const path = require('path');
const bcrypt = require('bcrypt');

// Require database connection file
const connection = require('../db/connection');

// Require util
const util = require('util');

const query = util.promisify(connection.query).bind(connection);

// Admin dashboard
module.exports.admin_dashboard_get = async (req, res) => {
    try {
        // Get Staff
        const allStaff = await query('SELECT * FROM doctors INNER JOIN users ON doctors.user_id = users.user_id WHERE users.role = ?', 'staff');
        console.log('All staff: ', allStaff.length);
    
        // Get Patients
        const allPatients = await query('SELECT * FROM patients INNER JOIN users ON patients.user_id = users.user_id WHERE users.role = ?', 'patient');
        console.log('All patients: ', allPatients.length);

        res.render(path.join(__dirname, '../views/admin_dashboard'), { allStaff, allPatients, type: 'general' });
    } catch (error) {
        console.log('Internal Server Error: ', error);
        res.render(path.join(__dirname, '../views/admin_dashboard'), { type: 'error' });
    }
};

// Get all staff
module.exports.get_all_staff = async (req, res) => {
    try {
        const allStaff = await query('SELECT * FROM doctors INNER JOIN users ON doctors.user_id = users.user_id WHERE users.role = ?', 'staff');
        console.log('All staff: ', allStaff);
    
        res.render(path.join(__dirname, '../views/admin_dashboard'), { allStaff, type: 'all_staff' });
    } catch (error) {
        console.log('Internal Server Error: ', error);
        res.render(path.join(__dirname, '../views/admin_dashboard'), { type: 'error' });
    }
};

// Get all patients
module.exports.get_all_patients = async (req, res) => {
    try {
        const allPatients = await query('SELECT * FROM patients INNER JOIN users ON patients.user_id = users.user_id WHERE users.role = ?', 'patient');
        console.log('All patients: ', allPatients);
    
        res.render(path.join(__dirname, '../views/admin_dashboard'), { allPatients, type: 'all_patients' });
    } catch (error) {
        console.log('Internal Server Error: ', error);
        res.render(path.join(__dirname, '../views/admin_dashboard'), { type: 'error' });
    }
};

// Add Staff
module.exports.add_staff_post = async (req, res) => {
    const { fullName, email, phoneNo, specialization, yearsOfExperience } = req.body;
    let defaultPassword = 'Password@123';
    console.log(req.body);
    
    // First, check if all details was provided
    if (!fullName || !email || !phoneNo || !specialization || !yearsOfExperience) {
        console.log('Incomplete details');
        return res.redirect('/admin/dashboard');
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log('Invalid email');
        return res.redirect('/admin/dashboard');
    }

    try {
        // Check if email has already been used
        const checkEmail = await query('SELECT email FROM users WHERE email = ?', email);
        console.log(email);
        
        if (checkEmail.length > 0) {
            console.log('Email has already been used');
            return res.redirect('/admin/dashboard');
        }

        // Hash password
        let saltRounds = 10;
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

        /* After validation has been passed,
        Create the Staff */
        const createStaff = await query('INSERT INTO users (full_name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)', [fullName, email, hashedPassword, phoneNo, 'staff']);

        // Now, insert into the doctor's table
        const insertIntoDoctorsTable = await query('INSERT INTO doctors (user_id, specialization, years_of_experience) VALUES (?, ?, ?)', [createStaff.insertId, specialization, yearsOfExperience]);

        console.log('Successfully created staff');
        return res.redirect('/admin/dashboard');
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.redirect('/admin/dashboard');
    }    
};

// Add Patient
module.exports.add_patient_post = async (req, res) => {
    const { fullName, email, phoneNo, dob, gender, address } = req.body;
    let defaultPassword = 'Password@246';
    console.log(req.body);
    
    // First, check if all details was provided
    if (!fullName || !email || !phoneNo || !dob || !gender || !address) {
        console.log('Incomplete details');
        return res.redirect('/admin/dashboard');
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log('Invalid email');
        return res.redirect('/admin/dashboard');
    }

    try {
        // Check if email has already been used
        const checkEmail = await query('SELECT email FROM users WHERE email = ?', email);
        console.log(email);
        
        if (checkEmail.length > 0) {
            console.log('Email has already been used');
            return res.redirect('/admin/dashboard');
        }

        // Hash password
        let saltRounds = 10;
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

        /* After validation has been passed,
        Create the Patient */
        const createPatient = await query('INSERT INTO users (full_name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)', [fullName, email, hashedPassword, phoneNo, 'patient']);

        // Now, insert into the doctor's table
        const insertIntoPatientsTable = await query('INSERT INTO patients (user_id, date_of_birth, gender, address) VALUES (?, ?, ?, ?)', [createPatient.insertId, dob, gender, address]);

        console.log('Successfully created Patient');
        return res.redirect('/admin/dashboard');
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.redirect('/admin/dashboard');
    }
}