import { Schema, model} from 'mongoose';

const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true
  },
  content: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    }
  }]
}, {
  timestamps: true
});

postSchema.index({user: 1});

export default model('Post', postSchema);