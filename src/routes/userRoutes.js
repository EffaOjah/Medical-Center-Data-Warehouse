const { Router } = require('express');

const router = Router();

// Require staffController middleware
const userController = require('../controllers/userController');

// Require jwt module
const { verifyUserToken } = require('../jwt/verifyToken');

// Get Routes
// Admin dashboard route
router.get('/patient/dashboard', verifyUserToken, userController.patient_dashboard_get);

module.exports = router;