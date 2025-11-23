const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: { type: String, enum: ['post','follow','like','user_deleted','post_deleted'], required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },       // who did it
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who was affected (followed / deleted)
  targetPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // which post (if any)
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
