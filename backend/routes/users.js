const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const User = require('../models/User');
const createActivity = require('../utils/createActivity');

// follow
router.post('/:id/follow', auth, async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target || target.isDeleted) return res.status(404).json({ error: 'User not found' });

    // if target blocked requester or requester blocked target -> disallow
    if (target.blockedUsers.map(String).includes(req.user._id.toString())) return res.status(403).json({ error: 'You are blocked by this user' });
    if (req.user.blockedUsers.map(String).includes(target._id.toString())) return res.status(403).json({ error: 'You have blocked this user' });

    if (!req.user.following.map(String).includes(target._id.toString())) {
      req.user.following.push(target._id);
      await req.user.save();
    }
    if (!target.followers.map(String).includes(req.user._id.toString())) {
      target.followers.push(req.user._id);
      await target.save();
    }
    await createActivity({ type: 'follow', actor: req.user._id, targetUser: target._id });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// unfollow
router.post('/:id/unfollow', auth, async (req, res, next) => {
  try {
    req.user.following = req.user.following.filter(x => x.toString() !== req.params.id);
    await req.user.save();
    const target = await User.findById(req.params.id);
    if (target) {
      target.followers = target.followers.filter(x => x.toString() !== req.user._id.toString());
      await target.save();
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

// block
router.post('/:id/block', auth, async (req, res, next) => {
  try {
    if (!req.user.blockedUsers.map(String).includes(req.params.id)) {
      req.user.blockedUsers.push(req.params.id);
      await req.user.save();
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

// unblock
router.post('/:id/unblock', auth, async (req, res, next) => {
  try {
    req.user.blockedUsers = req.user.blockedUsers.filter(x => x.toString() !== req.params.id);
    await req.user.save();
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Owner makes admin
router.post('/:id/make-admin', auth, requireRole('owner'), async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    u.role = 'admin';
    await u.save();
    res.json({ success: true, user: { id: u._id, role: u.role } });
  } catch (err) { next(err); }
});

// Admin/Owner delete (soft delete)
router.delete('/:id', auth, requireRole('admin', 'owner'), async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    u.isDeleted = true;
    await u.save();
    await createActivity({ type: 'user_deleted', actor: req.user._id, targetUser: u._id });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
