const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const logger = require('../controllers/logger')
// Define routes for room operations
router.get('/', roomController.getAllRooms,(req,res)=>{
    res.send(req.rooms)
});
router.get('/least/room', logger.leastRoom,(req,res)=>{
    res.send(req.result)
});
router.get('/:id/', roomController.getRoomById);
router.post('/', roomController.createRoom);
router.post('/:id', roomController.updateRoomById);
router.delete('/:id', roomController.deleteRoomById);

module.exports = router;
