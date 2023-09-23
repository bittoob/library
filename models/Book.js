const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  account_number: String,
  self_number: String,
  title: String,
  
  
  
});
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;