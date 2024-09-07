const { Booking, User, Room } = require('../models');
const logger = require('./logger')
const { Op } = require('sequelize');
const exceljs = require('exceljs');
const cron = require('node-cron')
const path = require('path');
const fs = require('fs')
// Create a new booking
exports.createBooking = async (req, res) => {
    const { userId, roomId } = req.body;

    try {
        const newBooking = await Booking.create({ userId, roomId });
        logger.logActivity(userId,`checked in`,`Time : ${Date.now()} room id : ${roomId}`,0)
        res.status(201).redirect(req.get('Referer'));
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Check-out a booking
exports.checkOutBooking = async (req, res) => {
    const { id } = req.params;
    const checkOutTime = new Date(); // Use current timestamp for check-out time

    try {
        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Calculate duration in hours
        const checkInTime = booking.checkInTime;
        const user = await User.findByPk(booking.userId); // Await the user query to get the user details
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const duration = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Duration in hours

        // Assuming you have a predefined rate per hour, e.g., $20 per hour
        const ratePerHour = 20;
        const cost = duration * ratePerHour;

        booking.checkOutTime = checkOutTime;
        booking.duration = duration;
        booking.cost = cost;
        booking.status = 'completed';
        await booking.save();

        // Prepare the response data
        const responseData = {
            checkInTime: booking.checkInTime,
            duration: booking.duration,
            cost: booking.cost,
            userName: user.name
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error checking out booking:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.exportBookingsToExcel = async(req,res) => {
    try {
        const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.findAll({
        where: {
            checkInTime: {
                [Op.between]: [startOfDay, endOfDay]
            }
        },
        include: [
            { model: User, attributes: ['name', 'email'] },
            { model: Room, attributes: ['name'] }
        ]
    });

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Bookings');

    worksheet.columns = [
        { header: 'Booking ID', key: 'id', width: 10 },
        { header: 'User Name', key: 'userName', width: 20 },
        { header: 'User Email', key: 'userEmail', width: 30 },
        { header: 'Room Name', key: 'roomName', width: 20 },
        { header: 'Check-In Time', key: 'checkInTime', width: 20 },
        { header: 'Check-Out Time', key: 'checkOutTime', width: 20 },
        { header: 'Duration', key: 'duration', width: 10 },
        { header: 'Cost', key: 'cost', width: 10 },
        { header: 'Status', key: 'status', width: 15 }
    ];

    bookings.forEach(booking => {
        worksheet.addRow({
            id: booking.id,
            userName: booking.User.name,
            userEmail: booking.User.email,
            roomName: booking.Room.name,
            checkInTime: booking.checkInTime,
            checkOutTime: booking.checkOutTime,
            duration: booking.duration,
            cost: booking.cost,
            status: booking.status
        });
    });

    const dirPath = path.resolve(__dirname,'..');
    const filePath = path.join(dirPath, 'assets','exports',`bookings_${new Date().toISOString().split('T')[0]}.xlsx`);

    // Ensure the directory exists
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    await workbook.xlsx.writeFile(filePath);
    console.log("file path is"+filePath);
    res.redirect('/')
    console.log('Bookings exported to Excel successfully.');
    } catch (error) {
        res.send(error.message)
    }
    // res.redirect('/')
}



exports.exportBookingsToExcelByDate = async (req, res) => {
    const date = req.params.date;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  
    try {
      const bookings = await Booking.findAll({
        where: {
          checkInTime: {
            [Op.between]: [startOfDay, endOfDay]
          }
        },
        include: [
          { model: User, attributes: ['name', 'email'] },
          { model: Room, attributes: ['name'] }
        ]
      });
  
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Bookings');
  
      worksheet.columns = [
        { header: 'Booking ID', key: 'id', width: 10 },
        { header: 'User Name', key: 'userName', width: 20 },
        { header: 'User Email', key: 'userEmail', width: 30 },
        { header: 'Room Name', key: 'roomName', width: 20 },
        { header: 'Check-In Time', key: 'checkInTime', width: 20 },
        { header: 'Check-Out Time', key: 'checkOutTime', width: 20 },
        { header: 'Duration', key: 'duration', width: 10 },
        { header: 'Cost', key: 'cost', width: 10 },
        { header: 'Status', key: 'status', width: 15 }
      ];
  
      bookings.forEach(booking => {
        worksheet.addRow({
          id: booking.id,
          userName: booking.User.name,
          userEmail: booking.User.email,
          roomName: booking.Room.name,
          checkInTime: booking.checkInTime,
          checkOutTime: booking.checkOutTime,
          duration: booking.duration,
          cost: booking.cost,
          status: booking.status
        });
      });
  
        const dirPath = path.resolve(__dirname,'..');
        const filePath = path.join(dirPath, 'assets','exports',`bookings_${new Date(date).toISOString().split('T')[0]}.xlsx`);

  
      // Ensure the directory exists
    //   if (!fs.existsSync(assetsDir)) {
        // fs.mkdirSync(assetsDir, { recursive: true });
        // console.log(`Created directory: ${assetsDir}`);
    //   }
  
     
    //   console.log(`Exporting to: ${exportsDir}`);
  
      await workbook.xlsx.writeFile(filePath);
      console.log('Bookings exported to Excel successfully to ' + filePath);
  
      res.send(`Exported at ${filePath}`);
    } catch (e) {
      console.error('Error:', e);
      res.send(`Error: ${e.message}`);
    }
  }

exports.getBookingsByDate = async (req, res) => {
    const { date } = req.params;

    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await Booking.findAll({
            where: {
                checkInTime: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            },
            include: [
                { model: User, attributes: ['name', 'email', 'phone'] },
                { model: Room, attributes: ['name'] }
            ]
        });

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings by date:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllBookings = async (req, res,next) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: User, attributes: ['name', 'email', 'phone'] },
                { model: Room, attributes: ['name'] }
            ]
        });

        req.bookings = bookings;
        next();
        // res.send(bookings)
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Schedule the task to run at 00:00 every day
// cron.schedule('0 0 * * *', () => {
//     console.log('Running the exportBookingsToExcel job at 00:00');
//     exportBookingsToExcel().catch(error => {
//         console.error('Error exporting bookings:', error);
//     });
// })

