const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// Basic seat operations
router.get('/', seatController.getAllSeats);
// router.get('/reserved', seatController.getReservedSeats);
// router.get('/empty', seatController.getEmptySeats);
// router.get('/row/:row', seatController.getSeatsByRow);
// router.get('/:id', seatController.getSeatStatus);

// Advanced seat operations
// router.get('/available/:row', seatController.getAvailableSeatsInRow);
// router.get('/consecutive/:count', seatController.findConsecutiveEmptySeats);

// Seat management
router.get('/initialize', seatController.initializeSeats);
router.post('/reserve', seatController.reserveSeats);
router.post('/cancel', seatController.cancelSeats);

module.exports = router;
