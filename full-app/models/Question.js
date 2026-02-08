/*
 * Question Schema
 * Stores user's questions with reference to User
 */

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries by user
questionSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Question', questionSchema);
