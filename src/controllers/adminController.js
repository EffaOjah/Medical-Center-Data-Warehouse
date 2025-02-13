require('dotenv').config();
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');

const refreshToken = process.env.refreshToken; // expires after every 3599 seconds
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;

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

        // Send Email
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.email, // Email that is sending the email
              pass: process.env.pass, // Password of the email (App Password if using basic auth)
              clientId: process.env.clientId,
              clientSecret: process.env.clientSecret,
              refreshToken: process.env.refreshToken
            }
          });
      
          const mailOptions = {
            from: 'effaojah@gmail.com',
            to: `${email}`,
            subject: 'Welcome!',
            html: `
              <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background: #ffffff; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <div style="background: rgb(228, 86, 121); color: #fff; text-align: center; padding: 20px; font-size: 22px; font-weight: bold;">
                  Medical Centre Data Warehouse System<br>University of Calabar
                </div>
                <div style="padding: 20px; color: #333; font-size: 16px; line-height: 1.5;">
                  <p>Hello, ${fullName}</p>
                  <p>Thank you for visiting the <strong>University of Calabar</strong> medical center.</p>
                  <p>We hope this email finds you well.</p>
                  <p>These are your login details: <br> 
                    <ul>
                        <li>Email: ${email}</li>
                        <li>Password: ${defaultPassword}</li>
                    </ul>
                  </p>
                  <p>Best regards,<br>Medical Centre Data Warehouse Team</p>
                </div>
                <div style="background: #eee; text-align: center; padding: 10px; font-size: 14px; color: #666;">
                  &copy; 2025 University of Calabar. All rights reserved.
                </div>
              </div>
            `
          };

          const info = await transporter.sendMail(mailOptions);
          console.log('Email sent successfully:', info.response);

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

        // Send Email
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.email, // Email that is sending the email
              pass: process.env.pass, // Password of the email (App Password if using basic auth)
              clientId: process.env.clientId,
              clientSecret: process.env.clientSecret,
              refreshToken: process.env.refreshToken
            }
          });
      
          const mailOptions = {
            from: 'effaojah@gmail.com',
            to: `${email}`,
            subject: 'Welcome!',
            html: `
              <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background: #ffffff; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <div style="background: rgb(228, 86, 121); color: #fff; text-align: center; padding: 20px; font-size: 22px; font-weight: bold;">
                  Medical Centre Data Warehouse System<br>University of Calabar
                </div>
                <div style="padding: 20px; color: #333; font-size: 16px; line-height: 1.5;">
                  <p>Hello, ${fullName}</p>
                  <p>Thank you for visiting the <strong>University of Calabar</strong> medical center.</p>
                  <p>We hope this email finds you well.</p>
                  <p>These are your login details: <br> 
                    <ul>
                        <li>Email: ${email}</li>
                        <li>Password: ${defaultPassword}</li>
                    </ul>
                  </p>
                  <p>Best regards,<br>Medical Centre Data Warehouse Team</p>
                </div>
                <div style="background: #eee; text-align: center; padding: 10px; font-size: 14px; color: #666;">
                  &copy; 2025 University of Calabar. All rights reserved.
                </div>
              </div>
            `
          };

          const info = await transporter.sendMail(mailOptions);
          console.log('Email sent successfully:', info.response);
        console.log('Successfully created Patient');
        return res.redirect('/admin/dashboard');
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.redirect('/admin/dashboard');
    }
}

// Test Node Mailer
module.exports.test_node_mailer = async (req, res) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.email, // Email that is sending the email, note: it must be the email you used while creating the app
          pass: process.env.pass, // Password of the email
          clientId: clientId,
          clientSecret: clientSecret,
          refreshToken: refreshToken
        }
      });
      
      const mailOptions = {
        from: 'effaojah@gmail.com',
        to: 'ojaheffa@gmail.com',
        subject: 'Welcome!',
        html: `
          <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background: #ffffff; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="background: rgb(228, 86, 121); color: #fff; text-align: center; padding: 20px; font-size: 22px; font-weight: bold;">
              Medical Centre Data Warehouse System<br>University of Calabar
            </div>
            <div style="padding: 20px; color: #333; font-size: 16px; line-height: 1.5;">
              <p>Hello,</p>
              <p>This is an important message from the <strong>Medical Centre Data Warehouse System</strong> for the <strong>University of Calabar</strong>.</p>
              <p>We hope this email finds you well.</p>
              <p>Best regards,<br>Medical Centre Data Warehouse Team</p>
            </div>
            <div style="background: #eee; text-align: center; padding: 10px; font-size: 14px; color: #666;">
              &copy; 2025 University of Calabar. All rights reserved.
            </div>
          </div>
        `
      };
      
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.error(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      
};

// Automatical Intergration of data for doctors
module.exports.fetch_doctors = async (req, res) => {
  fs.readFile(path.join(__dirname, '../json/doctors.json'), async (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading JSON file');
    }
    
    const doctors = JSON.parse(data);
    // console.log(doctors);

    // Step 1: Get all existing emails from the database
    const existingEmails = await query('SELECT email FROM users');
    const emailSet = new Set(existingEmails.map(row => row.email));
    // console.log(emailSet);

    // Step 2: Filter out users whose email already exists
    const newDoctors = doctors.filter(user => !emailSet.has(user.email));
    console.log(newDoctors, 'length: ', newDoctors.length);
    
    
    if (newDoctors.length === 0) {
        console.log('No new users to insert.');
        return res.json({ error: 'No data to fetch' });
    }
    let defaultPassword = 'Password@123';

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      for (const doctor of newDoctors) {
        const insert1 = await query('INSERT INTO users (full_name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)', [doctor.fullName, doctor.email, hashedPassword, doctor.phoneNumber, 'staff']);

        // Get the insertId
        const userId = insert1.insertId;

        // Insert into the doctors table with the user_id from the users table
        const insert2 = await query('INSERT INTO doctors (user_id, specialization, years_of_experience) VALUES (?, ?, ?)', [userId, doctor.specialization, doctor.yearsOfExperience]);

        console.log(`Inserted user: ${doctor.fullName} with ID: ${userId}`);
        return res.json({ success: 'fetched data' });
      }
    } catch (error) {
        console.log('Error inserting: ', error);
        return res.json({ error: 'An error occured' });
    }
  });
};

// Automatical Intergration of data for patients
module.exports.fetch_patients = async (req, res) => {
  fs.readFile(path.join(__dirname, '../json/patients.json'), async (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading JSON file');
    }
    
    const patients = JSON.parse(data);
    // console.log(doctors);

    // Step 1: Get all existing emails from the database
    const existingEmails = await query('SELECT email FROM users');
    const emailSet = new Set(existingEmails.map(row => row.email));
    // console.log(emailSet);

    // Step 2: Filter out users whose email already exists
    const newPatients = patients.filter(user => !emailSet.has(user.email));
    console.log(newPatients, 'length: ', newPatients.length);
    
    
    if (newPatients.length === 0) {
        console.log('No new users to insert.');
        return res.json({ error: 'No data to fetch' });
    }
    let defaultPassword = 'Password@246';

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      for (const patient of newPatients) {
        const insert1 = await query('INSERT INTO users (full_name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)', [patient.fullName, patient.email, hashedPassword, patient.phoneNumber, 'patient']);

        // Get the insertId
        const userId = insert1.insertId;

        // Insert into the patients table with the user_id from the users table
        const insert2 = await query('INSERT INTO patients (user_id, date_of_birth, gender, address) VALUES (?, ?, ?, ?)', [userId, patient.dateOfBirth, patient.gender, patient.address]);

        console.log(`Inserted user: ${patient.fullName} with ID: ${userId}`);
        return res.json({ success: 'fetched data' });
      }
    } catch (error) {
        console.log('Error inserting: ', error);
        return res.json({ error: 'An error occured' });
    }
  });
};