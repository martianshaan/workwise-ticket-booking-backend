const express = require('express');
const router = express.Router();
const { syncUser } = require('../controllers/authController');


router.post('/', syncUser)

module.exports = router;

