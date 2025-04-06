var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('./config/passport')(passport); // Passport configuration
require('dotenv').config();

var indexRouter = require('./routes/index'); // Router for the index page and authentication
var usersRouter = require('./routes/users'); // Router for user-related actions (optional, if needed)
const connectDB = require('./config/db'); // Database connection
const User = require('./models/User_Schema'); // Import User model 

// Connect to MongoDB
connectDB();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); // Views directory setup
app.set('view engine', 'ejs'); // EJS templating engine

// Middleware setup
app.use(cors());
app.use(logger('dev')); // Logging middleware
app.use(express.json()); // Middleware to parse JSON data
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data
app.use(cookieParser()); // Middleware to parse cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Session and Passport configuration
app.use(session({
  secret: 'yourSecretKey',  // Use a strong secret
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialization and deserialization for user sessions
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Fetch the user from DB by ID
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Route handling
app.use('/', indexRouter); // Routes defined in routes/index.js
app.use('/users', usersRouter); // Optional routes for users (not defined yet, remove if not needed)

// Catch 404 errors and forward to error handler
app.use(function (req, res, next) {
  next(createError(404)); // Forward 404 errors to error handler
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message; // Set the error message
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // Show error stack only in development

  res.status(err.status || 500); // Send status code
  res.render('error'); // Render error page
});

// Export the app instance
module.exports = app;
