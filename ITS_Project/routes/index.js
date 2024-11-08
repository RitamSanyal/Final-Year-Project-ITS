var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const StreamSelection = require('../models/StreamSelection'); // Import the StreamSelection model

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

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

router.post('/login', passport.authenticate('local'), (req, res) => {
  console.log('Session:', req.session); // Debugging session data
  res.status(200).json({ message: 'Logged in successfully' });
});


router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: 'Failed to log out' });
    res.status(200).json({ message: 'Logged out successfully' });
  });
});


router.post('/select-stream', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user._id;
    const { stream_choice } = req.body;

    // Check if the user already has a stream selection
    const existingSelection = await StreamSelection.findOne({ user_id: userId });

    if (existingSelection) {
      return res.status(400).json({
        error: 'User has already selected a stream',
        current_selection: existingSelection.stream_choice
      });
    }

    // Create a new stream selection if none exists
    const selection = await StreamSelection.create({
      user_id: userId,
      stream_choice: stream_choice
    });

    res.status(200).json({ message: 'Stream selection saved', selection });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while saving stream selection' });
  }
});

router.put('/update-stream', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user._id;
    const { stream_choice } = req.body;

    // Find the existing selection for the user
    const existingSelection = await StreamSelection.findOne({ user_id: userId });

    if (!existingSelection) {
      return res.status(404).json({ error: 'No stream selection found to update' });
    }

    // Update the stream choice
    existingSelection.stream_choice = stream_choice;
    await existingSelection.save();

    res.status(200).json({ message: 'Stream selection updated', selection: existingSelection });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating stream selection' });
  }
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Please log in to access this resource' });
}


module.exports = router;
