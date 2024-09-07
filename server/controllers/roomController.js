const { Room,Booking,User } = require('../models');
const { Op } = require('sequelize');

// Get all rooms
exports.getAllRooms = async (req, res,next) => {
    try {
        const rooms = await Room.findAll();
        // res.json(rooms);
        req.rooms = rooms
        next();
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'An error occurred while fetching rooms' });
    }
};

// Get room by ID
exports.getRoomById = async (req, res,next) => {
    const { id } = req.params;

    try {
        const room = await Room.findByPk(id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        // res.json(room);
        req.room = room
        next();
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'An error occurred while fetching the room' });
    }
};

// Create a new room
exports.createRoom = async (req, res) => {
    const { name, cap, type, cph } = req.body;

    try {
        const newRoom = await Room.create({ name, cap, type,cph});
        // res.status(201).json(newRoom);
        res.redirect(req.get('Referer'))
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'An error occurred while creating the room' });
    }
};

// Update room by ID
exports.updateRoomById = async (req, res) => {
    const { id } = req.params;
    const { name, cap, type } = req.body;
    console.log(cap)

    try {
        const room = await Room.findByPk(id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        room.name = name;
        room.cap = cap;
        room.type = type;
        await room.save();

        res.redirect(req.get('Referer'));
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'An error occurred while updating the room' });
    }
};

// Delete room by ID
exports.deleteRoomById = async (req, res) => {
    const { id } = req.params;

    try {
        const room = await Room.findByPk(id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        await room.destroy();
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'An error occurred while deleting the room' });
    }
};

exports.getTotallyFree = async (req, res, next)=> {
    try {
        // Find all rooms with ongoing bookings
        const roomsWithBookings = await Booking.findAll({
            where: { status: 'ongoing' },
            attributes: ['roomId'],
            group: ['roomId'],
        });

        // Extract the room IDs that have ongoing bookings
        const bookedRoomIds = roomsWithBookings.map(booking => booking.roomId);

        // Find all rooms that are not in the list of booked room IDs
        const freeRooms = await Room.findAll({
            where: {
                id: {
                    [Op.notIn]: bookedRoomIds
                }
            },
            attributes: ['id', 'name', 'cap'] // Assuming 'cap' is the capacity field
        });

        // Pass the free rooms data to the next middleware
        req.freeRooms = freeRooms;
        next();
    } catch (error) {
        console.error('Error fetching totally free rooms:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.getNumberOfTotallyFreeRooms = async (req,res,next)=>{

    try {
        // Find all rooms with ongoing bookings
        const roomsWithBookings = await Booking.findAll({
            where: { status: 'ongoing' },
            attributes: ['roomId'],
            group: ['roomId'],
        });

        // Extract the room IDs that have ongoing bookings
        const bookedRoomIds = roomsWithBookings.map(booking => booking.roomId);

        // Count all rooms that are not in the list of booked room IDs
        const freeRoomsCount = await Room.count({
            where: {
                id: {
                    [Op.notIn]: bookedRoomIds
                }
            }
        });

        // Pass the free rooms count to the next middleware
        req.freeRoomsCount = freeRoomsCount;
        next();
    } catch (error) {
        console.error('Error fetching number of totally free rooms:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.getUsersByRooms = async (req, res, next) => {
    const roomId = req.params.id;
    try {
        const bookings = await Booking.findAll({
            where: {
                roomId: roomId,
                status: "ongoing"
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone', 'balance'] // Include only necessary user attributes
                }
            ]
        });

        const users = bookings.map(booking => ({
            bookingId: booking.id,
            userId: booking.User.id,
            name: booking.User.name,
            email: booking.User.email,
            phone: booking.User.phone,
            balance: booking.User.balance,
            checkInTime : booking.checkInTime
        }));

        req.roomUsers = users;
        req.roomId = roomId;
        next();
    } catch (error) {
        console.error('Error fetching users by room:', error);
        res.status(500).send("error: " + error.message);
    }
};