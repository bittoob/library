const router = require('express').Router();
const User = require('../models/user.model');
const Book = require('../models/Book');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
const { registerValidator } = require('../utils/validators');

router.get(
  '/login',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    res.render('login', { user: req.user });
  }
);

router.post(
  '/login',
  ensureLoggedOut({ redirectTo: '/' }),
  passport.authenticate('local', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
);

router.get(
  '/books',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  async (req, res, next) => {
    try {
      const books = await Book.find(); // Fetch list of books from the database
      res.render('books', { books, user: req.user }); // Pass the list of books to the view
    } catch (error) {
      next(error);
    }
  }
);




router.get(
  '/add',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  async (req, res, next) => {
    try {
      // You might need to add some additional logic here if needed
      res.render('add', { user: req.user });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/add',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  async (req, res, next) => {
    try {
      // Extract book details from the request body
      const { account_number,self_number,title } = req.body;

      // Create a new book instance and save it to the database
      const newBook = new Book({ account_number,self_number,title});
      await newBook.save();

      // Redirect to the "Books" page after successful addition
      res.redirect('/auth/books');
    } catch (error) {
      next(error);
    }
  }
);
// ... (existing imports)

router.get(
  '/books/search',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  async (req, res, next) => {
    try {
      const searchTerm = req.query.q;
      const books = await Book.find({
        title: { $regex: searchTerm, $options: 'i' },
      });
      res.render('books', { books, user: req.user, searchTerm });
    } catch (error) {
      next(error);
    }
  }
);


router.get(
  '/register',
  ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    res.render('register', { user: req.user });
  }
);

router.post(
  '/register',
  ensureLoggedOut({ redirectTo: '/' }),
  registerValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash('error', error.msg);
        });
        res.render('register', {
          email: req.body.email,
          messages: req.flash(),
          user: req.user,
        });
        return;
      }

      const { email } = req.body;
      const doesExist = await User.findOne({ email });
      if (doesExist) {
        req.flash('warning', 'Username/email already exists');
        res.redirect('/auth/register');
        return;
      }
      const user = new User(req.body);
      await user.save();
      req.flash(
        'success',
        `${user.email} registered successfully, you can now login`
      );
      res.redirect('/auth/login');
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/logout',
  ensureLoggedIn({ redirectTo: '/' }),
  async (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  }
);

module.exports = router;