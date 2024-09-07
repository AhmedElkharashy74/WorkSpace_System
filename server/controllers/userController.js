const { User } = require('../models');
const { Op,Sequelize  } = require('sequelize');

// Get all users
exports.getAllUsers = async (req, res,next) => {
    try {
        const users = await User.findAll();
        // res.json(users);
        req.users = users;
        next();
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
        // req.user = user;
        // next();
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new user
exports.createUser = async (req, res) => {
    const { name, email , phone} = req.body;
    console.log(name)
    try {
        const newUser = await User.create({ name, email, phone });
        res.status(201).redirect('/users')
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update user by ID
exports.updateUserById = async (req, res) => {
    const { id } = req.params;
    const { username, email,phone,balance } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.name = username;
        user.email = email;
        user.phone = phone;
        user.balance = balance;
        await user.save();

        res.redirect('/users');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete user by ID
exports.deleteUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.destroy();
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateUserBalance = async (req, res) => {
    const { id } = req.params;
    const { balance } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.balance = balance;
        await user.save();

        res.json(user);
    } catch (error) {
        console.error('Error updating user balance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
      const query = req.query.q.toLowerCase().trim();
      const guests = await User.findAll({
        where: {
          [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', `%${query}%`),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), 'LIKE', `%${query}%`),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('phone')), 'LIKE', `%${query}%`)
          ]
        },
        limit: 10 // Adjust the limit as needed
      });
      return res.status(200).json(guests);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };