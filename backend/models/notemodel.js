import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId
    required: true,
    ref: 'User', // Optional, if you want to reference User schema
  },
  createdAt: {
    type: Date,
    default: Date.now, // Changed to function
  },
});

const Note = mongoose.model("Note", noteSchema);

export default Note;
