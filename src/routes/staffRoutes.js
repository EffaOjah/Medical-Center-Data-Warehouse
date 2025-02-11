const { Router } = require('express');

const router = Router();

// Require staffController middleware
const staffController = require('../controllers/staffController');

// Require jwt module
const { verifyStaffToken } = require('../jwt/verifyToken');

// Get Routes
// Admin dashboard route
router.get('/staff/dashboard', verifyStaffToken, staffController.staff_dashboard_get);

// Patient details route
router.get('/patient/:id', verifyStaffToken, staffController.patient_details_get);



// POST Routes
// Add medical record route
router.post('/add-medical-record', verifyStaffToken, staffController.add_medical_record_post);

// Add treatment route
router.post('/add-treatment', verifyStaffToken, staffController.add_treatment_post);

module.exports = router;