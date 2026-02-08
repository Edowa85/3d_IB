/*
 * 3Dcard - Full Application Server
 * Express + MongoDB + EJS
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');

// Import models
const User = require('./models/User');
const Question = require('./models/Question');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================
// DATABASE CONNECTION
// ============================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/3dcard')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ============================
// MIDDLEWARE
// ============================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/compliance', express.static(path.join(__dirname, '../compliance')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Set EJS as view engine
app.set('view engine', 'ejs');

// ============================
// AUTH MIDDLEWARE
// ============================
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// ============================
// DEFAULT QUESTIONS (for new users)
// ============================
const defaultQuestions = [
  "What's something you've always wanted to try but haven't yet?",
  "If you could travel anywhere right now, where would you go?",
  "What's the most spontaneous thing you've ever done?",
  "What's a skill you wish you could instantly master?",
  "What's the best piece of advice you've ever received?",
  "If you could have dinner with anyone, living or dead, who would it be?",
  "What's a movie you can watch over and over again?",
  "What's something that always makes you laugh?",
  "What's on your bucket list that you haven't told many people?",
  "If you could switch lives with anyone for a day, who would it be?"
];

// ============================
// ROUTES
// ============================

// === HOME ===
app.get('/', async (req, res) => {
  try {
    let questions = [];

    if (req.session.user) {
      // Get user's questions
      questions = await Question.find({ createdBy: req.session.user._id });

      // If user has no questions, add defaults
      if (questions.length === 0) {
        for (const text of defaultQuestions) {
          await Question.create({
            text: text,
            createdBy: req.session.user._id
          });
        }
        questions = await Question.find({ createdBy: req.session.user._id });
      }
    }

    res.render('home', { questions, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.render('home', { questions: [], user: req.session.user });
  }
});

// === AUTH: SIGNUP ===
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('signup', { error: 'Username already exists' });
    }

    // Create user
    const user = await User.create({ username, password });

    // Log user in
    req.session.user = {
      _id: user._id,
      username: user.username
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('signup', { error: 'Error creating account' });
  }
});

// === AUTH: LOGIN ===
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    // Log user in
    req.session.user = {
      _id: user._id,
      username: user.username
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Error logging in' });
  }
});

// === AUTH: LOGOUT ===
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// === QUESTIONS (CRUD) ===

// GET all questions (for random selection)
app.get('/api/questions/random', requireLogin, async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.session.user._id });
    if (questions.length === 0) {
      return res.json({ text: 'Add some questions to get started!' });
    }
    const random = questions[Math.floor(Math.random() * questions.length)];
    res.json(random);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching question' });
  }
});

// POST create question
app.post('/questions', requireLogin, async (req, res) => {
  try {
    const { text } = req.body;
    await Question.create({
      text,
      createdBy: req.session.user._id
    });
    res.redirect('/questions');
  } catch (err) {
    console.error(err);
    res.redirect('/questions');
  }
});

// PUT update question
app.put('/questions/:id', requireLogin, async (req, res) => {
  try {
    const { text } = req.body;
    const question = await Question.findOne({
      _id: req.params.id,
      createdBy: req.session.user._id
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    question.text = text;
    await question.save();
    res.redirect('/questions');
  } catch (err) {
    console.error(err);
    res.redirect('/questions');
  }
});

// DELETE question
app.delete('/questions/:id', requireLogin, async (req, res) => {
  try {
    await Question.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.session.user._id
    });
    res.redirect('/questions');
  } catch (err) {
    console.error(err);
    res.redirect('/questions');
  }
});

// === QUESTIONS PAGE ===
app.get('/questions', requireLogin, async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.session.user._id }).sort({ createdAt: -1 });
    res.render('questions', { questions });
  } catch (err) {
    console.error(err);
    res.render('questions', { questions: [] });
  }
});

// === DOCUMENTATION ===
app.get('/documentation', (req, res) => {
  res.render('documentation');
});

// ============================
// START SERVER
// ============================
app.listen(PORT, () => {
  console.log(`🚀 3Dcard server running on http://localhost:${PORT}`);
});
