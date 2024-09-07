
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define routes for user operations
router.get('/', userController.getAllUsers, (req,res)=>{
    res.send(req.users)
});
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.post('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
