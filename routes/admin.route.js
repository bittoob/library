const User = require('../models/user.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');

// CREATE - Add a new user
router.post('/create-user', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    // Check if name, email, and password are provided
    if (!name || !email || !password) {
      req.flash('error', 'Name, email, and password are required');
      return res.redirect('back');
    }

    // Check for valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'User with this email already exists');
      return res.redirect('back');
    }

    // Create a new user
    const user = new User({ name, email, password, role });
    await user.save();

    req.flash('success', 'User created successfully');
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
});

// READ - View all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.render('manage-users', { users });
  } catch (error) {
    next(error);
  }
});

// UPDATE - Update user's role
router.post('/update-role/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    // Check for Valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    // Admin cannot remove himself/herself as an admin
    if (req.user.id === id && role === roles.admin) {
      req.flash(
        'error',
        'Admins cannot remove themselves from Admin, ask another admin.'
      );
      return res.redirect('back');
    }

    // Finally update the user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    req.flash('info', `Updated role for ${user.name} (${user.email}) to ${user.role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

// DELETE - Delete a user
router.post('/delete-user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    // Admin cannot remove himself/herself
    if (req.user.id === id) {
      req.flash('error', 'Admins cannot delete themselves');
      return res.redirect('back');
    }

    // Finally delete the user
    await User.findByIdAndDelete(id);

    req.flash('info', 'User deleted successfully');
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

module.exports = router;