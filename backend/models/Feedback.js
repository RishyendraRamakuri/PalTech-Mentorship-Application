const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  pairing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pairing',
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    enum: ['Pair only', 'Pair + Observers'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
