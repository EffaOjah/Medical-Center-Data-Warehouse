const { Router } = require('express');

const router = Router();

// Require authController middleware
const adminController = require('../controllers/adminController');

// Require jwt module
const { verifyAdminToken } = require('../jwt/verifyToken');

// Get Routes
// Admin dashboard route
router.get('/admin/dashboard', verifyAdminToken, adminController.admin_dashboard_get);

// All Staff route
router.get('/all-staff', verifyAdminToken, adminController.get_all_staff);

// All Patients route
router.get('/all-patients', verifyAdminToken, adminController.get_all_patients);

// Test Node Mailer
router.get('/test-node-mailer', verifyAdminToken, adminController.test_node_mailer);

// Fetch doctors
router.get('/fetch-doctors', verifyAdminToken, adminController.fetch_doctors);

// Fetch patients
router.get('/fetch-patients', verifyAdminToken, adminController.fetch_patients);


// POST Routes
// Route to add staff
router.post('/add-staff', verifyAdminToken, adminController.add_staff_post);

// Route to add patient
router.post('/add-patient', verifyAdminToken, adminController.add_patient_post);


module.exports = router;