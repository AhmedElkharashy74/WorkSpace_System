const user = require('./userController');
const room = require('./roomController');
const booking = require('./bookingController');
const logger = require('./logger');
const {exec} = require('child_process');
const path = require('path');


exports.home = async (req,res)=>{
    const rooms = req.rooms
    const topRooms = req.topRooms
    const activeUsers = req.activeUsers
    const leastRoom = req.result
    const cueentEarnings = logger.calculateCurrentEarnings();
    const totalUsers = req.totalUsers
    const totalFreeSpace = req.totalFreeSpace
    const totalSpace = req.totalSpace
    const freeRoomsNum = req.freeRoomsCount
    const roomsNum = rooms.length
    const earnings = await logger.calculateCurrentEarnings();
    console.log(topRooms)
    // console.log(earnings + " " + typeof(earnings))
    res.render('index', {
        rooms : rooms,
        topRooms : topRooms,
        active : activeUsers,
        least : leastRoom,
        cueentEarnings : cueentEarnings,
        guests : totalUsers, 
        freeSpace : totalFreeSpace,
        totalSpace : totalSpace,
        freeRoomsNum : freeRoomsNum,
        roomsNum : roomsNum,
        earnings : earnings
    });
}

exports.users = async (req,res)=>{
    const users = req.users
    const topRooms = req.topRooms
    console.log('users ' + topRooms)

    res.render('users',{
        users : users,
        topRooms:topRooms
    })
}

exports.openExportFolder = (req, res)=>{
    // Define the folder path where the Excel files are stored
    const dirPath = path.resolve(__dirname,'..');
    const folderPath = path.join(dirPath, 'assets', 'exports');
  
    // Platform-specific command to open the folder
    const command =
      process.platform === 'win32' ? `start "" "${folderPath}"` : 
      process.platform === 'darwin' ? `open "${folderPath}"` : 
      `xdg-open "${folderPath}"`;
  
    exec(command, (error) => {
      if (error) {
        console.error(`Error opening folder: ${error}`);
        return res.status(500).send('Error opening folder.');
      }
      res.redirect('/');
    });
  }

exports.rooms = async (req,res)=>{
  const rooms = await logger.getRoomData();
  const topRooms = req.topRooms

  console.log(rooms+ "meow")
  res.render('rooms',{
    rooms : rooms,
    topRooms : topRooms
  });
}

exports.roomusers = async (req,res)=>{
    const roomUsers = await req.roomUsers;
    const roomId = req.roomId;
    const rooms = req.rooms
    const topRooms = req.topRooms


    // console.log(roomUsers)

    res.render('userRooms',{
      users:roomUsers,
      roomId : roomId,
      rooms:rooms,
      topRooms : topRooms
    })
}

exports.bookings = async (req,res)=>{
  const bookings = await req.bookings;
  const topRooms = req.topRooms


  res.render('booking',{
    bookings : bookings,
    
    topRooms:topRooms
  })
}