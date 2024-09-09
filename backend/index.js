import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from './models/usermodel.js';
import Note from './models/notemodel.js';
import Cookies from 'js-cookie';
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
app.use(cors({
  origin: 'https://mind-scribe-phi.vercel.app',  // Your frontend URL
  credentials: true  // Allows sending of cookies
}));

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = Cookies.get('access_token');
  console.log("Token received:", token);  // Debugging line to check if token is received

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err);  // Log error if token verification fails
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
};

// Error handler function to create error objects
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
    const isValidUser = await User.findOne({ email });

    if (isValidUser) {
      return next(errorHandler(400, 'User already exists'));
    }

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
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(401, 'Wrong credentials'));
    }

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const { password: pass, ...rest } = validUser._doc;

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
    });
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: rest,
      token: token
    });
  } catch (error) {
    next(error);
  }
});

// Route to handle user logout
app.get('/api/auth/signout', (req, res, next) => {
  try {
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

  if (!title || !content) {
    return next(errorHandler(400, 'Title and content are required'));
  }

  try {
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

// Route to retrieve all notes for the authenticated user
app.get('/api/note/all', verifyToken, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const notes = await Note.find({ userId }).sort({ isPinned: -1 });
    res.status(200).json({ success: true, message: 'All notes retrieved successfully', notes });
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
