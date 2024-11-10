var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const StreamSelection = require('../models/StreamSelection');
const path = require('path');

// Middleware to check if the user has already selected a stream
const checkStreamSelected = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const user = await User.findById(req.user.id);  // Find the user
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if the user has a stream selection in the StreamSelection model
      const streamSelection = await StreamSelection.findOne({ user_id: req.user.id });
      if (streamSelection) {
        // If a stream is already selected, redirect to the profile
        return res.redirect('/profile');
      }
    } catch (error) {
      console.error('Error in checkStreamSelected middleware:', error);
      return res.status(500).send('Server error');
    }
  } else {
    return res.status(401).json({ message: 'Please log in to access this resource' });
  }
  next();
};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'Username already exists' });

    user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route with redirection logic
router.post('/login', passport.authenticate('local'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);  // Find the user by ID

    // Check if the user has a stream selection
    const streamSelection = await StreamSelection.findOne({ user_id: req.user.id });

    if (!streamSelection) {
      // Redirect to stream selection if the stream is not chosen
      return res.redirect('/select-stream');
    } else {
      // Redirect to profile if the stream is already chosen
      return res.redirect('/profile');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login redirection' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: 'Failed to log out' });
    return res.redirect("/");
  });
});

// Route to render the stream selection page with checkStreamSelected middleware
router.get('/select-stream', ensureAuthenticated, checkStreamSelected, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/select-stream.html'));
});

// Select stream route
router.post('/select-stream', async (req, res) => {
  try {
    const userId = req.user._id;
    const { stream_choice } = req.body;

    // Save the stream selection
    const selection = await StreamSelection.create({
      user_id: userId,
      stream_choice: stream_choice
    });

    // Update user’s stream choice
    await User.findByIdAndUpdate(userId, { stream_choice: stream_choice });

    // Send a JSON response instructing the frontend to redirect
    return res.json({ redirect: '/profile' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while saving stream selection' });
  }
});

// Route to render the update stream page
router.get('/update-stream', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const streamSelection = await StreamSelection.findOne({ user_id: req.user.id });

    // Set currentStream to the selected stream or a default value if none found
    const currentStream = streamSelection ? streamSelection.stream_choice : '';

    // Render the update-stream.ejs page and pass currentStream data
    res.render('update-stream', { currentStream });
  } catch (error) {
    console.error('Error fetching current stream:', error);
    res.status(500).json({ message: 'Server error while fetching stream data' });
  }
});

// Update stream route
router.put('/update-stream', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      // Return error in JSON format if user is not authenticated
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user._id;
    const { stream_choice } = req.body;

    // Check if the user has an existing stream selection
    let existingSelection = await StreamSelection.findOne({ user_id: userId });

    if (!existingSelection) {
      // If no stream selection found, create a new selection for the user
      existingSelection = await StreamSelection.create({
        user_id: userId,
        stream_choice: stream_choice
      });
      return res.status(200).json({ message: 'Stream selection created', selection: existingSelection });
    }

    // If a stream selection exists, update it with the new stream choice
    existingSelection.stream_choice = stream_choice;
    await existingSelection.save();

    // Send response back with the updated stream selection
    res.status(200).json({ message: 'Stream selection updated', selection: existingSelection });
  } catch (error) {
    console.error(error);
    // Send server error in JSON format if any issues occur
    res.status(500).json({ error: 'An error occurred while updating stream selection' });
  }
});

// Profile route
router.get('/profile', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const streamSelection = await StreamSelection.findOne({ user_id: req.user.id });

    if (!streamSelection) {
      return res.status(404).json({ message: 'Stream selection not found' });
    }

    // Pass user and stream data to profile view
    res.render('profile', { user, streamChoice: streamSelection.stream_choice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching profile data' });
  }
});

// Delete user route
router.delete('/delete-user', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user from the User collection
    await User.findByIdAndDelete(userId);

    // Optionally, delete the user's stream selection if it exists
    await StreamSelection.deleteMany({ user_id: userId });

    // Log out the user after deletion and send a success message
    req.logout(err => {
      if (err) return res.status(500).json({ error: 'Failed to log out' });
      res.status(200).json({ message: 'User deleted successfully and logged out' });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the user' });
  }
});


// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Please log in to access this resource' });
}

module.exports = router;
