const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.put('/checkout/:id', bookingController.checkOutBooking);
// router.get('/', bookingController.getAllBookings);  
router.get('/',bookingController.getAllBookings);

module.exports = router;
