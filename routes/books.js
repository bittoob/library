const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

router.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.render('books', { books });
  } catch (error) {
    console.error(error);
    res.send('An error occurred.');
  }
});

router.get('/add', (req, res) => {
  res.render('add');
});

router.post('/add', async (req, res) => {
  const { account_number,self_number,title  } = req.body;
  try {
    const newBook = new Book({account_number,self_number,title,isAvailable:true });
    await newBook.save();
    res.redirect('/books');
  } catch (error) {
    console.error(error);
    res.send('An error occurred.');
  }
});

router.get('/search', async (req, res) => {
  const searchTerm = req.query.q;

  try {
    const searchResults = await Book.find({
      title: { $regex: searchTerm, $options: 'i' }, // Case-insensitive search
    });

    res.json({ searchResults }); // Return the search results as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred.' });
  }
});

module.exports = router;
