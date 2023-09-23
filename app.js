// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const app = express();
// const port = process.env.PORT || 3000;

// app.set('view engine', 'ejs');
// app.use(express.static('public'));
// app.use(bodyParser.urlencoded({ extended: true }));

// mongoose.connect('mongodb://127.0.0.1:27017/library', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const indexRoutes = require('./routes/index');
// const booksRoutes = require('./routes/books');
// app.use('/', indexRoutes);
// app.use('/books', booksRoutes);

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


//for login
const express = require('express');
const createHttpError = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');
const connectMongo = require('connect-mongo');
const { ensureLoggedIn } = require('connect-ensure-login');
const { roles } = require('./utils/constants');
const amqp = require('amqplib');
const logger = require('winston');

// Import producer and consumer modules
const { sendToQueue } = require('./producer');
const { consumeFromQueue } = require('./consumer');

// Initialization
const app = express();
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const MongoStore = connectMongo(session);

// Init Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// For Passport JS Authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Connect Flash
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use('/', require('./routes/index.route'));
app.use('/auth', require('./routes/auth.route'));

// Protected routes for authenticated users
app.use(
  '/user',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  require('./routes/user.route')
);

// Protected routes for admin users
app.use(
  '/admin',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  ensureAdmin,
  require('./routes/admin.route')
);
const booksRouter = require('./routes/books'); // Adjust the path as needed
app.use('/books', booksRouter);
// Routes
app.get('/send-message', async (req, res) => {
  try {
    await sendToQueue('Hello, RabbitMQ!');
    res.send('Message sent to queue.');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Error sending message.');
  }
});

app.get('/consume-message', async (req, res) => {
  try {
    await consumeFromQueue();
    res.send('Message consumed from queue.');
  } catch (error) {
    console.error('Error consuming message:', error);
    res.status(500).send('Error consuming message.');
  }
});

// 404 Handler
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

// Error Handler
app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.render('error_40x', { error });
});

// Setting the PORT
const PORT = process.env.PORT || 3000;

// Making a connection to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('💾 connected...');
    // Listening for connections on the defined PORT
    app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
  })
  .catch((err) => console.log(err.message));

function ensureAdmin(req, res, next) {
  if (req.user && req.user.role === roles.admin) {
    next();
  } else {
    req.flash('warning', 'You are not authorized to see this route');
    res.redirect('/');
  }
}