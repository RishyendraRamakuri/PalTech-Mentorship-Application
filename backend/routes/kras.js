const express = require('express');
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require('express-validator');
const KRA = require('../models/KRA');
const KPI = require('../models/KPI');
const KPIUpdate = require('../models/KPIUpdate');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(auth);

// @route   POST /api/pairings/:pairingId/kras
// @desc    Create a KRA
// @access  Private (Mentor/Mentee only)
router.post('/kras', [
  checkRole(['Mentor', 'Mentee']),
  body('title', 'KRA title is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (req.pairing.status === 'Ended') {
    return res.status(400).json({ msg: 'Cannot add KRAs to an ended pairing' });
  }

  try {
    const kra = new KRA({
      pairing: req.params.pairingId,
      title: req.body.title,
      description: req.body.description,
      createdBy: req.user.id
    });

    await kra.save();
    res.json(kra);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/pairings/:pairingId/kras
// @desc    Get all KRAs and their KPIs for a pairing
// @access  Private
router.get('/kras', checkRole(['Mentor', 'Mentee', 'Observer']), async (req, res) => {
  try {
    // Fetch all KRAs for the pairing
    const kras = await KRA.find({ pairing: req.params.pairingId }).lean();
    
    // Fetch all KPIs for the pairing
    const kpis = await KPI.find({ pairing: req.params.pairingId }).lean();

    // Group KPIs by KRA
    const krasWithKpis = kras.map(kra => {
      kra.kpis = kpis.filter(kpi => kpi.kra.toString() === kra._id.toString());
      return kra;
    });

    res.json(krasWithKpis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/pairings/:pairingId/kras/:kraId/kpis
// @desc    Create a KPI under a KRA
// @access  Private (Mentor/Mentee only)
router.post('/kras/:kraId/kpis', [
  checkRole(['Mentor', 'Mentee']),
  body('title', 'KPI title is required').not().isEmpty(),
  body('targetValue', 'Target value is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (req.pairing.status === 'Ended') {
    return res.status(400).json({ msg: 'Cannot add KPIs to an ended pairing' });
  }

  try {
    const kra = await KRA.findById(req.params.kraId);
    if (!kra || kra.pairing.toString() !== req.params.pairingId) {
      return res.status(404).json({ msg: 'KRA not found on this pairing' });
    }

    const kpi = new KPI({
      kra: req.params.kraId,
      pairing: req.params.pairingId,
      title: req.body.title,
      targetValue: req.body.targetValue,
      currentValue: req.body.currentValue || '',
      status: req.body.status || 'On track',
      dueDate: req.body.dueDate,
      createdBy: req.user.id
    });

    await kpi.save();
    res.json(kpi);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/pairings/:pairingId/kpis/:kpiId/updates
// @desc    Log a KPI update
// @access  Private (Mentor/Mentee only)
router.post('/kpis/:kpiId/updates', [
  checkRole(['Mentor', 'Mentee']),
  body('newValue', 'New value is required').not().isEmpty(),
  body('newStatus', 'New status is required').isIn(['On track', 'At risk', 'Off track'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (req.pairing.status === 'Ended') {
    return res.status(400).json({ msg: 'Cannot update KPIs on an ended pairing' });
  }

  try {
    const kpi = await KPI.findById(req.params.kpiId);
    if (!kpi || kpi.pairing.toString() !== req.params.pairingId) {
      return res.status(404).json({ msg: 'KPI not found on this pairing' });
    }

    const update = new KPIUpdate({
      kpi: req.params.kpiId,
      pairing: req.params.pairingId,
      previousValue: kpi.currentValue,
      newValue: req.body.newValue,
      newStatus: req.body.newStatus,
      note: req.body.note,
      author: req.user.id
    });

    await update.save();

    // Update the KPI itself
    kpi.currentValue = req.body.newValue;
    kpi.status = req.body.newStatus;
    await kpi.save();

    res.json({ update, kpi });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/pairings/:pairingId/kpis/:kpiId/updates
// @desc    Get paginated KPI updates
// @access  Private
router.get('/kpis/:kpiId/updates', checkRole(['Mentor', 'Mentee', 'Observer']), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const query = { 
      kpi: req.params.kpiId,
      pairing: req.params.pairingId
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const updates = await KPIUpdate.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email');

    const total = await KPIUpdate.countDocuments(query);

    res.json({
      data: updates,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
