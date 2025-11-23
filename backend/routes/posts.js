const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const Post = require('../models/Post');
const User = require('../models/User');
const createActivity = require('../utils/createActivity');

// create post
router.post('/', auth, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const post = await Post.create({ author: req.user._id, content });
    await createActivity({ type: 'post', actor: req.user._id, targetPost: post._id });
    res.json({ post });
  } catch (err) { next(err); }
});

// like
router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author');
    if (!post || post.isDeleted) return res.status(404).json({ error: 'Post not found' });

    // block checks: if author blocked requester or requester blocked author -> disallow
    if (post.author.blockedUsers.map(String).includes(req.user._id.toString())) return res.status(403).json({ error: 'You are blocked by author' });
    if (req.user.blockedUsers.map(String).includes(post.author._id.toString())) return res.status(403).json({ error: 'You have blocked the author' });

    if (!post.likes.map(String).includes(req.user._id.toString())) {
      post.likes.push(req.user._id);
      await post.save();
      await createActivity({ type: 'like', actor: req.user._id, targetPost: post._id, targetUser: post.author._id });
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

// unlike
router.post('/:id/unlike', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.likes = post.likes.filter(x => x.toString() !== req.user._id.toString());
    await post.save();
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Admin/Owner delete post (soft)
router.delete('/:id', auth, requireRole('admin', 'owner'), async (req, res, next) => {
  try {
    const p = await Post.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Post not found' });
    p.isDeleted = true;
    await p.save();
    await createActivity({ type: 'post_deleted', actor: req.user._id, targetPost: p._id, targetUser: p.author });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// get posts for a user (respect block)
router.get('/user/:id', auth, async (req, res, next) => {
  try {
    const author = await User.findById(req.params.id);
    if (!author || author.isDeleted) return res.status(404).json({ error: 'User not found' });

    // If author blocked requester or requester blocked author, return empty
    if (author.blockedUsers.map(String).includes(req.user._id.toString()) || req.user.blockedUsers.map(String).includes(author._id.toString())) {
      return res.json({ posts: [] });
    }

    const posts = await Post.find({ author: author._id, isDeleted: false }).sort({ createdAt: -1 }).populate('author', 'name');
    res.json({ posts });
  } catch (err) { next(err); }
});

module.exports = router;
