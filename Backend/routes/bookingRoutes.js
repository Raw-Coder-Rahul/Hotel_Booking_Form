const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Existing routes
router.post('/create-order', bookingController.createOrder);
router.post('/save-booking', bookingController.saveBooking);
router.get('/bookings', bookingController.getBookings);

// New route to expose Razorpay key
router.get('/get-key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
