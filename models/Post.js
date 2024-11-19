const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamps: true
    // createdAt: {
    //   type: Date,
    //   default: Date.now.toISOString(),
    // }
  }]
}, {
  timestamps: true
});

postSchema.index({user: 1});

module.exports = mongoose.model('Post', postSchema);