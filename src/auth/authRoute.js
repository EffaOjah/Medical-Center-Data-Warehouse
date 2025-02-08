const { Router } = require('express');

const router = Router();

// Require authController middleware
const authController = require('./authController');

// Get route for the login page
router.get('/login/:role', authController.login_get);


// POST routes
// Admin login route
router.post('/admin-login', authController.admin_login_post);

// Staff login route
router.post('/staff-login', authController.staff_login_post);

// Patient login route
router.post('/patient-login', authController.patient_login_post);




module.exports = router;