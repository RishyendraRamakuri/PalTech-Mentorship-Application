const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require('express-validator');
const OneOnOne = require('../models/OneOnOne');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/pairings/:pairingId/1on1s
// @desc    Create a 1:1 session
// @access  Private (Mentor/Mentee only)
router.post('/', [
  checkRole(['Mentor', 'Mentee']),
  body('date', 'Date is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Prevent adding if pairing is ended
  if (req.pairing.status === 'Ended') {
    return res.status(400).json({ msg: 'Cannot add 1:1s to an ended pairing' });
  }

  const { date, agenda, notes, actionItems, visibility } = req.body;

  try {
    const new1on1 = new OneOnOne({
      pairing: req.params.pairingId,
      date,
      agenda,
      notes,
      actionItems: actionItems || [],
      visibility: visibility || 'Pair only',
      createdBy: req.user.id
    });

    const session = await new1on1.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/pairings/:pairingId/1on1s
// @desc    Get all 1:1s for a pairing (with pagination, sorting, filters, and visibility checks)
// @access  Private
router.get('/', checkRole(['Mentor', 'Mentee', 'Observer']), async (req, res) => {
  try {
    const { sort = 'desc', openActionItems, page = 1, limit = 20 } = req.query;
    
    let query = { pairing: req.params.pairingId };

    // Visibility Check
    if (req.userRole === 'Observer') {
      // Observers can only see 'Pair + Observers' 1:1s
      query.visibility = 'Pair + Observers';
    }

    if (openActionItems === 'true') {
      query['actionItems.status'] = { $in: ['Open', 'In Progress'] };
    }

    const sortOrder = sort === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sessions = await OneOnOne.find(query)
      .sort({ date: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('actionItems.owner', 'name email');

    const total = await OneOnOne.countDocuments(query);

    res.json({
      data: sessions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/pairings/:pairingId/1on1s/:sessionId
// @desc    Update a 1:1 session (including action items)
// @access  Private (Mentor/Mentee only)
router.put('/:sessionId', [
  checkRole(['Mentor', 'Mentee'])
], async (req, res) => {
  try {
    const session = await OneOnOne.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    if (session.pairing.toString() !== req.params.pairingId) {
      return res.status(400).json({ msg: 'Session does not belong to this pairing' });
    }

    const { date, agenda, notes, actionItems, visibility } = req.body;

    if (date) session.date = date;
    if (agenda !== undefined) session.agenda = agenda;
    if (notes !== undefined) session.notes = notes;
    if (actionItems) session.actionItems = actionItems;
    if (visibility) session.visibility = visibility;

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
