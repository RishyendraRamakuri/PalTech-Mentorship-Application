const mongoose = require('mongoose');

const kpiUpdateSchema = new mongoose.Schema({
  kpi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KPI',
    required: true
  },
  pairing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pairing',
    required: true
  },
  previousValue: {
    type: String
  },
  newValue: {
    type: String
  },
  newStatus: {
    type: String,
    enum: ['On track', 'At risk', 'Off track']
  },
  note: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('KPIUpdate', kpiUpdateSchema);
