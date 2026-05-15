const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(auth);

// @route   POST /api/pairings/:pairingId/feedback
// @desc    Give feedback
// @access  Private (Mentor/Mentee only)
router.post('/', [
  checkRole(['Mentor', 'Mentee']),
  body('body', 'Feedback body is required').not().isEmpty(),
  body('visibility', 'Visibility is required').isIn(['Pair only', 'Pair + Observers'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Prevent adding if pairing is ended
  if (req.pairing.status === 'Ended') {
    return res.status(400).json({ msg: 'Cannot add feedback to an ended pairing' });
  }

  const { body: content, visibility } = req.body;
  const pairing = req.pairing;

  let toUserId;
  if (req.userRole === 'Mentor') {
    toUserId = pairing.mentee;
  } else if (req.userRole === 'Mentee') {
    toUserId = pairing.mentor;
  }

  try {
    const feedback = new Feedback({
      pairing: req.params.pairingId,
      from: req.user.id,
      to: toUserId,
      body: content,
      visibility // Required and locked at creation
    });

    await feedback.save();
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/pairings/:pairingId/feedback
// @desc    Get feedback with filters, sorting, pagination, and visibility enforcement
// @access  Private
router.get('/', checkRole(['Mentor', 'Mentee', 'Observer']), async (req, res) => {
  try {
    const { sort = 'desc', direction, page = 1, limit = 20 } = req.query;

    let query = { pairing: req.params.pairingId };

    // Visibility Enforcement
    if (req.userRole === 'Observer') {
      query.visibility = 'Pair + Observers';
    }

    // Direction filter (sent vs received)
    if (direction === 'sent') {
      query.from = req.user.id;
    } else if (direction === 'received') {
      query.to = req.user.id;
    }

    const sortOrder = sort === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbackList = await Feedback.find(query)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('from', 'name email')
      .populate('to', 'name email');

    const total = await Feedback.countDocuments(query);

    res.json({
      data: feedbackList,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/pairings/:pairingId/feedback/:id
// @desc    Delete feedback (Author only)
// @access  Private
router.delete('/:id', checkRole(['Mentor', 'Mentee']), async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ msg: 'Feedback not found' });

    // Ensure it belongs to this pairing
    if (feedback.pairing.toString() !== req.params.pairingId) {
      return res.status(400).json({ msg: 'Feedback does not belong to this pairing' });
    }

    // Only author can delete
    if (feedback.from.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this feedback' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Feedback removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
