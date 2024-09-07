const schedule = require('node-schedule');
const ExcelJS = require('exceljs');
const { logs, User, Booking } = require('../models'); // Added Booking model
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { Room} = require('../models');
const { Sequelize } = require('sequelize');
const { nextTick } = require('process');

// Ensure the logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Function to generate the Excel sheet
async function generateLogSheet() {
    try {
        const logs = await logs.findAll({
            include: [{ model: User }],
            order: [['timestamp', 'ASC']],
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Activity Logs');

        worksheet.columns = [
            { header: 'User', key: 'user', width: 30 },
            { header: 'Action', key: 'action', width: 30 },
            { header: 'Timestamp', key: 'timestamp', width: 30 },
            { header: 'Details', key: 'details', width: 50 },
        ];

        logs.forEach(log => {
            worksheet.addRow({
                user: log.User.name,
                action: log.action,
                timestamp: log.timestamp,
                details: log.details,
            });
        });

        const filePath = path.join(logsDir, `activity_logs_${new Date().toISOString().slice(0, 10)}.xlsx`);
        await workbook.xlsx.writeFile(filePath);
        console.log(`Log sheet created: ${filePath}`);
    } catch (error) {
        console.error('Error generating log sheet:', error);
    }
}

// Schedule the task to run every day at 00:00
schedule.scheduleJob('0 0 * * *', generateLogSheet);

// Function to log a specific activity

async function logActivity(userId, action, details, cost) {
    try {
        await logs.create({
            userId,
            action,
            details,
            cost
        });
        console.log('Activity logged successfully.');
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}


// Function to retrieve logs for a specific user
async function getUserLogs(userId) {
    try {
        const logs = await logs.findAll({
            where: { userId },
            order: [['timestamp', 'ASC']],
        });
        return logs;
    } catch (error) {
        console.error('Error retrieving user logs:', error);
    }
}

// Function to retrieve logs within a date range
async function getLogsByDateRange(startDate, endDate) {
    try {
        const logs = await logs.findAll({
            where: {
                timestamp: {
                    [Op.between]: [startDate, endDate],
                },
            },
            order: [['timestamp', 'ASC']],
        });
        return logs;
    } catch (error) {
        console.error('Error retrieving logs by date range:', error);
    }
}

// Function to calculate total earnings for a specific day
async function calculateDailyEarnings(date) {
    try {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const earnings = await Booking.sum('cost', {
            where: {
                checkOutTime: {
                    [Op.between]: [startDate, endDate],
                },
            },
        });

        return earnings || 0;
    } catch (error) {
        console.error('Error calculating daily earnings:', error);
    }
}

// Function to calculate total earnings for a specific period
async function calculatePeriodEarnings(startDate, endDate) {
    try {
        const earnings = await Booking.sum('cost', {
            where: {
                checkOutTime: {
                    [Op.between]: [startDate, endDate],
                },
            },
        });

        return earnings || 0;
    } catch (error) {
        console.error('Error calculating period earnings:', error);
    }
}

async function calculateCurrentEarnings() {
    try {
        // Get the start and end of the current day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch all completed bookings for the current day
        const bookings = await Booking.findAll({
            where: {
                status: 'completed',
                checkOutTime: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        // Calculate total earnings
        const totalEarnings = bookings.reduce((sum, booking) => sum + booking.cost, 0);

        return totalEarnings;
    } catch (error) {
        console.error('Error calculating current earnings:', error);
        throw error;
    }
}

async function getActiveUsers(req, res,next){
    try {
        const activeBookings = await Booking.findAll({
            where: { status: 'ongoing' }, // Assuming 'ongoing' status indicates active sessions
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone'],
                },
                {
                    model: Room,
                    attributes: ['name'],
                },
                
            ],
            attributes: ['checkInTime','id'],
        });

        const activeUsers = activeBookings.map(booking => ({
            userId: booking.User.id,
            userName: booking.User.name,
            userEmail: booking.User.email,
            userPhone: booking.User.phone,
            roomName: booking.Room.name,
            checkInTime: booking.checkInTime,
            bookingId : booking.id
        }));

        // res.json(activeUsers);
        req.activeUsers = activeUsers;
        next();
    } catch (error) {
        console.error('Error fetching active users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





async function leastRoom(req, res, next) {
    try {
        // Get all ongoing bookings
        const activeBookings = await Booking.findAll({
            where: { status: 'ongoing' },
            attributes: [
                'roomId',
                [Sequelize.fn('COUNT', Sequelize.col('roomId')), 'guestCount'],
            ],
            group: ['roomId'],
        });

        // Create a map of roomId to guestCount
        const bookingMap = {};
        activeBookings.forEach(booking => {
            bookingMap[booking.roomId] = booking.dataValues.guestCount;
        });

        // Fetch all rooms with their capacities
        const rooms = await Room.findAll({
            attributes: ['id', 'name', 'cap'], // Fetching room capacity
        });

        // Map the results to include guest count and free places
        const result = rooms.map(room => {
            const guestCount = bookingMap[room.id] || 0;
            const freePlaces = room.cap - guestCount; // Calculate the number of free places

            return {
                roomId: room.id,
                roomName: room.name,
                guestCount: guestCount,
                freePlaces: freePlaces,
            };
        });

        // Sort rooms by guest count in ascending order (prioritizing empty rooms)
        result.sort((a, b) => a.guestCount - b.guestCount);

        // Limit the result to the top 7 rooms
        const limitedResult = result.slice(0, 4);

        // Pass the result to the next middleware
        req.result = limitedResult;
        next();
    } catch (error) {
        console.error('Error fetching least occupied rooms:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function totalUsers(req, res, next) {
    try {
        const total = await User.count();

        // Pass the total number of users to the next middleware or response
        req.totalUsers = total;
        next();
    } catch (error) {
        console.error('Error calculating total number of users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function totalFreeSpace(req, res, next) {
    try {
        // Fetch all rooms with their capacities
        const rooms = await Room.findAll({
            attributes: ['id', 'cap'],
        });

        // Fetch the count of ongoing bookings for each room
        const activeBookings = await Booking.findAll({
            where: { status: 'ongoing' },
            attributes: [
                'roomId',
                [Sequelize.fn('COUNT', Sequelize.col('roomId')), 'guestCount'],
            ],
            group: ['roomId'],
        });

        // Create a mapping of roomId to guest count
        const guestCounts = activeBookings.reduce((acc, booking) => {
            acc[booking.roomId] = booking.dataValues.guestCount;
            return acc;
        }, {});

        // Calculate the total free space
        let totalFreeSpace = 0;

        rooms.forEach(room => {
            const guestCount = guestCounts[room.id] || 0;
            const freeSpace = room.cap - guestCount;
            totalFreeSpace += freeSpace;
        });

        // Set the result in the request object to pass to the next middleware or send it as a response
        req.totalFreeSpace = totalFreeSpace;
        next();
    } catch (error) {
        console.error('Error calculating total free space:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function totalspace(req, res,next){
    try {
        const totalSpace = await Room.sum('cap');
        req.totalSpace = totalSpace;
        next();
    } catch (error) {
        console.error('Error calculating total space:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

async function getRoomData() {
    try {
        const rooms = await Room.findAll({
            include: [
                {
                    model: Booking,
                    where: { status: 'ongoing' }, // Only include ongoing bookings
                    required: false, // Include rooms even if there are no bookings
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'name', 'email', 'phone'], // Select only the required fields
                        }
                    ]
                }
            ]
        });
        
        // Transform the data to include guests in each room
        const roomData = rooms.map(room => {
            return {
                id: room.id,
                name: room.name,
                type: room.type,
                cap: room.cap,
                current: room.current,
                cph: room.cph,
                guests: room.Bookings.map(booking => ({
                    id: booking.User.id,
                    name: booking.User.name,
                    email: booking.User.email,
                    phone: booking.User.phone,
                    checkInTime: booking.checkInTime,
                }))
            };
        });

        return roomData;
    } catch (error) {
        console.error('Error fetching room data:', error);
        throw new Error('Internal Server Error');
    }
}


async function getTopRoomsByUsers(req, res, next) {
    try {
        // Get all ongoing bookings
        const activeBookings = await Booking.findAll({
            where: { status: 'ongoing' },
            attributes: [
                'roomId',
                [Sequelize.fn('COUNT', Sequelize.col('roomId')), 'guestCount'],
            ],
            group: ['roomId'],
        });

        // Create a map of roomId to guestCount
        const bookingMap = {};
        activeBookings.forEach(booking => {
            bookingMap[booking.roomId] = booking.dataValues.guestCount;
        });

        // Fetch all rooms with their capacities
        const rooms = await Room.findAll({
            attributes: ['id', 'name', 'cap'], // Fetching room capacity
        });

        // Map the results to include guest count and free places
        const result = rooms.map(room => {
            const guestCount = bookingMap[room.id] || 0;
            const freePlaces = room.cap - guestCount; // Calculate the number of free places

            return {
                roomId: room.id,
                roomName: room.name,
                guestCount: guestCount,
                freePlaces: freePlaces,
            };
        });

        // Sort rooms by guest count in ascending order (prioritizing empty rooms)
        result.sort((a, b) => a.guestCount - b.guestCount);

        // Limit the result to the top 7 rooms
        const limitedResult = result.slice(0, 8);

        // Pass the result to the next middleware
        req.topRooms = limitedResult;
        next();
    } catch (error) {
        console.error('Error fetching least occupied rooms:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    generateLogSheet,
    logActivity,
    getUserLogs,
    getLogsByDateRange,
    calculateDailyEarnings,
    calculatePeriodEarnings,
    calculateCurrentEarnings,
    getActiveUsers,
    leastRoom,
    totalUsers,
    totalFreeSpace,
    totalspace,
    getRoomData,
    getTopRoomsByUsers
};
