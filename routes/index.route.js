// const express = require('express');
// const router = express.Router();

// router.get('/', (req, res) => {
//   res.render('index');
// });

// module.exports = router;

//for login
const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('index');
});

module.exports = router;