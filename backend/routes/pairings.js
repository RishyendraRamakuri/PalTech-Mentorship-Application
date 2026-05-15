const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Pairing = require('../models/Pairing');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/pairings
// @desc    Create a pairing
// @access  Private
router.post('/', [
  body('mentorEmail', 'Mentor email is required').isEmail(),
  body('menteeEmail', 'Mentee email is required').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { mentorEmail, menteeEmail } = req.body;

  if (mentorEmail.toLowerCase() === menteeEmail.toLowerCase()) {
    return res.status(400).json({ msg: 'Mentor and mentee cannot be the same person' });
  }

  try {
    const mentor = await User.findOne({ email: mentorEmail.toLowerCase() });
    const mentee = await User.findOne({ email: menteeEmail.toLowerCase() });

    if (!mentor) return res.status(404).json({ msg: 'Mentor user not found' });
    if (!mentee) return res.status(404).json({ msg: 'Mentee user not found' });

    // Prevent duplicate pairings? Requirements don't explicitly forbid multiple pairings between same users, 
    // but usually a good idea. We'll allow it or skip it to stick strictly to requirements.

    const newPairing = new Pairing({
      mentor: mentor.id,
      mentee: mentee.id,
      createdBy: req.user.id
    });

    const pairing = await newPairing.save();
    res.json(pairing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/pairings
// @desc    Get all pairings for logged in user (with filters)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, role } = req.query;
    const userId = req.user.id;

    let query = {};

    if (status) {
      query.status = status;
    }

    const roleLower = role ? role.toLowerCase() : null;

    if (roleLower === 'mentor') {
      query.mentor = userId;
    } else if (roleLower === 'mentee') {
      query.mentee = userId;
    } else if (roleLower === 'observer') {
      query.observers = userId;
    } else {
      query.$or = [
        { mentor: userId },
        { mentee: userId },
        { observers: userId }
      ];
    }

    const pairings = await Pairing.find(query)
      .populate('mentor', 'name email')
      .populate('mentee', 'name email')
      .populate('observers', 'name email')
      .sort({ createdAt: -1 });

    res.json(pairings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/pairings/:pairingId
// @desc    Get a single pairing by ID
// @access  Private
router.get('/:pairingId', checkRole(['Mentor', 'Mentee', 'Observer']), async (req, res) => {
  try {
    const pairing = req.pairing;
    await pairing.populate(['mentor', 'mentee', 'observers']);

    res.json({
      pairing,
      userRole: req.userRole
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/pairings/:pairingId/observers
// @desc    Add an observer
// @access  Private (Mentor/Mentee only)
router.put('/:pairingId/observers', [
  checkRole(['Mentor', 'Mentee']),
  body('email', 'Observer email is required').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const observer = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!observer) {
      return res.status(404).json({ msg: 'Observer user not found' });
    }

    const pairing = req.pairing;

    // Check if already participant or observer
    if (pairing.mentor.toString() === observer.id || pairing.mentee.toString() === observer.id) {
      return res.status(400).json({ msg: 'User is already a participant' });
    }
    if (pairing.observers.some(obs => obs.toString() === observer.id)) {
      return res.status(400).json({ msg: 'User is already an observer' });
    }

    pairing.observers.push(observer.id);
    await pairing.save();

    // Repopulate for response
    await pairing.populate(['mentor', 'mentee', 'observers']);
    res.json(pairing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/pairings/:pairingId/observers/:observerId
// @desc    Remove an observer
// @access  Private (Mentor/Mentee only)
router.delete('/:pairingId/observers/:observerId', checkRole(['Mentor', 'Mentee']), async (req, res) => {
  try {
    const pairing = req.pairing;

    pairing.observers = pairing.observers.filter(
      obs => obs.toString() !== req.params.observerId
    );

    await pairing.save();
    res.json(pairing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/pairings/:pairingId/status
// @desc    Update pairing status
// @access  Private (Mentor/Mentee only)
router.put('/:pairingId/status', [
  checkRole(['Mentor', 'Mentee']),
  body('status', 'Invalid status').isIn(['Active', 'Paused', 'Ended'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const pairing = req.pairing;
    pairing.status = req.body.status;

    if (req.body.status === 'Ended' && !pairing.endDate) {
      pairing.endDate = Date.now();
    }

    await pairing.save();
    res.json(pairing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
