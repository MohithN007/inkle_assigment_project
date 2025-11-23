const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Post = require('../models/Post');

// Get activity wall (global) — filter using block rules and soft deletes
router.get('/', auth, async (req, res, next) => {
  try {
    const activities = await Activity.find({}).sort({ createdAt: -1 }).limit(200)
      .populate('actor', 'name isDeleted blockedUsers')
      .populate('targetUser', 'name isDeleted blockedUsers')
      .populate('targetPost', 'content isDeleted author');

    const out = [];
    for (const a of activities) {
      // skip if actor deleted
      if (!a.actor || a.actor.isDeleted) continue;

      // block checks: if actor blocked requester or requester blocked actor -> skip
      if (a.actor.blockedUsers && a.actor.blockedUsers.map(String).includes(req.user._id.toString())) continue;
      if (req.user.blockedUsers && req.user.blockedUsers.map(String).includes(a.actor._id.toString())) continue;

      // targetUser checks
      if (a.targetUser) {
        if (!a.targetUser || a.targetUser.isDeleted) continue;
        if (a.targetUser.blockedUsers && a.targetUser.blockedUsers.map(String).includes(req.user._id.toString())) continue;
        if (req.user.blockedUsers && req.user.blockedUsers.map(String).includes(a.targetUser._id.toString())) continue;
      }

      // post checks
      if (a.targetPost) {
        const p = a.targetPost;
        if (!p || p.isDeleted) continue;
        // if post author blocked requester or requester blocked author -> skip
        const authorId = p.author ? p.author.toString() : null;
        if (authorId) {
          const author = await User.findById(authorId).select('blockedUsers isDeleted');
          if (!author || author.isDeleted) continue;
          if (author.blockedUsers.map(String).includes(req.user._id.toString())) continue;
          if (req.user.blockedUsers.map(String).includes(author._id.toString())) continue;
        }
      }

      out.push({
        id: a._id,
        type: a.type,
        actor: { id: a.actor._id, name: a.actor.name },
        targetUser: a.targetUser ? { id: a.targetUser._id, name: a.targetUser.name } : null,
        targetPost: a.targetPost ? { id: a.targetPost._id, preview: a.targetPost.content.slice(0, 120) } : null,
        createdAt: a.createdAt
      });

      if (out.length >= 100) break;
    }

    res.json({ activities: out });
  } catch (err) { next(err); }
});

module.exports = router;
