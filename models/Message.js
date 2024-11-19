//schema for direct messages with friends

import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, 
{
  timestamps: true
})

messageSchema.index({sender: 1})
messageSchema.index({recipient: 1})

export default model('Message', messageSchema);