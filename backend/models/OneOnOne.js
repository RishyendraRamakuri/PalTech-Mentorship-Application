const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Done'],
    default: 'Open'
  }
});

const oneOnOneSchema = new mongoose.Schema({
  pairing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pairing',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  agenda: {
    type: String
  },
  notes: {
    type: String
  },
  actionItems: [actionItemSchema],
  visibility: {
    type: String,
    enum: ['Pair only', 'Pair + Observers'],
    default: 'Pair only'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('OneOnOne', oneOnOneSchema);
