const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');

// Booking operations
router.post('/', BookingController.createBooking);
router.get('/', BookingController.getBookings);
// router.get('/:id', BookingController.getBookingDetails);
router.post('/cancel', BookingController.cancelBooking);

// User-specific routes
// router.get('/user/:userId', BookingController.getUserBookings);
// router.get('/active', BookingController.getActiveBookings);

// Statistics and management
// router.get('/stats', BookingController.getBookingStats);
// router.post('/reset', BookingController.resetBookings);

module.exports = router;
