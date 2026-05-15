const mongoose = require('mongoose');

const kraSchema = new mongoose.Schema({
  pairing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pairing',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('KRA', kraSchema);
