
/*
Example of using Logger

const logger = require('./path/to/logger');

// Log an activity
logger.logActivity(userId, 'Checked In', 'Checked into Room 101');

// Calculate daily earnings
const dailyEarnings = await logger.calculateDailyEarnings(new Date());
console.log(`Total earnings for today: ${dailyEarnings}`);

// Calculate period earnings
const periodEarnings = await logger.calculatePeriodEarnings(new Date('2024-01-01'), new Date('2024-01-31'));
console.log(`Total earnings for the period: ${periodEarnings}`);
*/

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const adminController = require('../controllers/adminController')
const logger = require('../controllers/logger');
const user = require('../controllers/userController');
const room = require('../controllers/roomController')
const booking = require('../controllers/bookingController')


router.get('/',user.getAllUsers,logger.getTopRoomsByUsers,logger.leastRoom,logger.totalUsers,logger.totalFreeSpace,logger.totalspace,room.getNumberOfTotallyFreeRooms,room.getAllRooms,logger.getActiveUsers,room.getAllRooms,adminController.home);
router.get('/users/',logger.getTopRoomsByUsers,user.getAllUsers,adminController.users)
router.get('/export', booking.exportBookingsToExcel);
router.get('/Exports',adminController.openExportFolder);
router.get('/searchGuests',user.searchUsers);
router.get('/rooms',logger.getTopRoomsByUsers,adminController.rooms)
router.get('/rooms/:id', logger.getTopRoomsByUsers,room.getUsersByRooms , adminController.roomusers) 
router.get('/bookings',logger.getTopRoomsByUsers,booking.getAllBookings,adminController.bookings)
router.post('/bookings/:date',booking.exportBookingsToExcelByDate)

module.exports = router