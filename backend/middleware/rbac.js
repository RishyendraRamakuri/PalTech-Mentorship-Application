const Pairing = require('../models/Pairing');

// Middleware to resolve pairing role and optionally check permissions
const checkRole = (allowedRoles = ['Mentor', 'Mentee', 'Observer']) => {
  return async (req, res, next) => {
    try {
      const pairingId = req.params.pairingId || req.body.pairingId;
      if (!pairingId) {
        return res.status(400).json({ msg: 'pairingId is required' });
      }

      const pairing = await Pairing.findById(pairingId);
      if (!pairing) {
        return res.status(404).json({ msg: 'Pairing not found' });
      }

      const userId = req.user.id;
      let role = null;

      if (pairing.mentor.toString() === userId) {
        role = 'Mentor';
      } else if (pairing.mentee.toString() === userId) {
        role = 'Mentee';
      } else if (pairing.observers.some(obs => obs.toString() === userId)) {
        role = 'Observer';
      }

      if (!role) {
        return res.status(403).json({ msg: 'Access denied: not associated with this pairing' });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ msg: `Access denied for role: ${role}` });
      }

      // Attach pairing and role to request for downstream use
      req.pairing = pairing;
      req.userRole = role;

      next();
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error in RBAC check');
    }
  };
};

module.exports = { checkRole };
