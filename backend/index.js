import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from './models/usermodel.js';
import Note from './models/notemodel.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB using the connection string from the .env file
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Initialize express app
const app = express();

// Middleware to parse JSON, cookies, and handle CORS
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'https://mind-scribe-phi.vercel.app', credentials: true }));

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  // If no token is found, user is unauthorized
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Verify the token, if error occurs, user is forbidden
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Save user data from token to request object
    req.user = user;
    next();
  });
};

// Function to handle errors by creating a new Error object with status code and message
const errorHandler = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Basic route to check if API is running
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Route to handle user signup
app.post('/api/auth/signup', async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists in the database
    const isValidUser = await User.findOne({ email });

    if (isValidUser) {
      return next(errorHandler(400, 'User already exists'));
    }

    // Hash the password and save new user to the database
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
});

// Route to handle user login
app.post('/api/auth/signin', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if user exists in the database
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }

    // Compare the provided password with the hashed password in the database
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(401, 'Wrong credentials'));
    }

    // Create JWT token for the user
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;

    // Set token in a secure cookie and return user data
    res.cookie('access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: rest,
    });
  } catch (error) {
    next(error);
  }
});

// Route to handle user logout
app.get('/api/auth/signout', (req, res, next) => {
  try {
    // Clear the authentication token cookie
    res.clearCookie('access_token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// Route to check if the user is authenticated
app.get('/api/auth/check', verifyToken, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// Route to add a new note for the authenticated user
app.post('/api/note/add', verifyToken, async (req, res, next) => {
  const { title, content, tags } = req.body;
  const { id } = req.user;

  // Check if the required fields are provided
  if (!title) return next(errorHandler(400, 'Title is required'));
  if (!content) return next(errorHandler(400, 'Content is required'));

  try {
    // Create and save a new note
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: id,
    });
    await note.save();
    res.status(201).json({ success: true, message: 'Note added successfully', note });
  } catch (error) {
    next(error);
  }
});

// Route to edit an existing note by ID
app.post('/api/note/edit/:noteId', verifyToken, async (req, res, next) => {
  const note = await Note.findById(req.params.noteId);

  // Check if the note exists
  if (!note) return next(errorHandler(404, 'Note not found'));

  // Check if the authenticated user is the owner of the note
  if (req.user.id !== note.userId.toString()) {
    return next(errorHandler(401, 'You can only update your own note'));
  }

  const { title, content, tags, isPinned } = req.body;

  // Update the note fields if provided
  if (title) note.title = title;
  if (content) note.content = content;
  if (tags) note.tags = tags;
  if (isPinned !== undefined) note.isPinned = isPinned;

  try {
    await note.save();
    res.status(200).json({ success: true, message: 'Note updated successfully', note });
  } catch (error) {
    next(error);
  }
});

// Route to retrieve all notes for the authenticated user
app.get('/api/note/all', verifyToken, async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Fetch all notes belonging to the user, with pinned notes displayed first
    const notes = await Note.find({ userId: userId }).sort({ isPinned: -1 });
    res.status(200).json({ success: true, message: 'All notes retrieved successfully', notes });
  } catch (error) {
    next(error);
  }
});

// Route to delete a note by ID
app.delete('/api/note/delete/:noteId', verifyToken, async (req, res, next) => {
  const noteId = req.params.noteId;

  // Check if the note exists and belongs to the authenticated user
  const note = await Note.findOne({ _id: noteId, userId: req.user.id });

  if (!note) return next(errorHandler(404, 'Note not found'));

  try {
    // Delete the note from the database
    await Note.deleteOne({ _id: noteId, userId: req.user.id });
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Route to toggle the pinned status of a note by ID
app.put('/api/note/update-note-pinned/:noteId', verifyToken, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.noteId);

    // Check if the note exists
    if (!note) return next(errorHandler(404, 'Note not found'));

    // Check if the authenticated user is the owner of the note
    if (req.user.id !== note.userId.toString()) return next(errorHandler(401, 'You can only update your own note'));

    // Toggle the pinned status of the note
    note.isPinned = !note.isPinned;
    await note.save();
    res.status(200).json({ success: true, message: 'Note pinned status updated', note });
  } catch (error) {
    next(error);
  }
});

// Route to search for notes based on a query (title, content, or tags)
app.get('/api/note/search', verifyToken, async (req, res, next) => {
  const { query } = req.query;

  // Check if search query is provided
  if (!query) return next(errorHandler(400, 'Search query is required'));

  try {
    // Search for notes based on title, content, or tags
    const matchingNotes = await Note.find({
      userId: req.user.id,
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { content: { $regex: new RegExp(query, 'i') } },
        { tags: { $regex: new RegExp(query, 'i') } },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Notes matching the search query retrieved successfully',
      notes: matchingNotes,
    });
  } catch (error) {
    next(error);
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error("Error:", err);
  res.status(statusCode).json({ success: false, statusCode, message });
});

// Start the server on port 5000
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
