import {Schema, model} from 'mongoose';
import User from '../../../319-mongodb/SBA/models/User';

const UserSchema = new Schema({
  name: {
    first: { type: String, required: true },
    last: { type: String },
    display: { type: String, required: true }
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Post' 
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {timestamps: true}
) 

UserSchema.createIndexes(); // create indexes automatically

//indexes
// UserSchema.index({userId: 1})
// UserSchema.index({display: 1})
// UserSchema.index({email: 1})


export default model('User', UserSchema);