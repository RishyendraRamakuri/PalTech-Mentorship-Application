require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const pairingRoutes = require('./routes/pairings');
const oneOnOneRoutes = require('./routes/oneOnOnes');
const feedbackRoutes = require('./routes/feedback');
const krasRoutes = require('./routes/kras');

app.use('/api/auth', authRoutes);
app.use('/api/pairings', pairingRoutes);
app.use('/api/pairings/:pairingId/1on1s', oneOnOneRoutes);
app.use('/api/pairings/:pairingId/feedback', feedbackRoutes);
app.use('/api/pairings/:pairingId', krasRoutes);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('<username>')) {
  console.warn('⚠️ MONGODB_URI is not set correctly in .env file.');
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
