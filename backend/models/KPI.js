const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  kra: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KRA',
    required: true
  },
  pairing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pairing',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  targetValue: {
    type: String,
    required: true
  },
  currentValue: {
    type: String
  },
  status: {
    type: String,
    enum: ['On track', 'At risk', 'Off track'],
    default: 'On track'
  },
  dueDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('KPI', kpiSchema);
