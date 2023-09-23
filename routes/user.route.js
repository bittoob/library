const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../utils/authMiddleware');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

// Profile Page
router.get('/profile', ensureAuthenticated, async (req, res, next) => {
  const person = req.user;
  res.render('profile', { person });
});

// Edit User Profile
router.post('/edit-profile', ensureAuthenticated, [
  // Add any validation rules here if needed
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Handle validation errors
      // You can render the profile page with errors here
      return;
    }

    const { name, password, confirmPassword } = req.body;

    // Find the user by ID
    const user = await User.findById(req.user._id);

    // Update user's name
    user.name = name;

    // Update user's password if provided
    if (password) {
      if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match');
        res.redirect('/user/profile');
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the updated user object
    await user.save();

    req.flash('success', 'Profile updated successfully');
    res.redirect('/user/profile');
  } catch (error) {
    next(error);
  }
});

module.exports = router;