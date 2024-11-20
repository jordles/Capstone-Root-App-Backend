import {Schema, model} from 'mongoose';

const UserSchema = new Schema({
  name: {
    first: { type: String, required: true },
    last: { type: String },
    display: { type: String, max: 20, required: true },
    handle: { type: String, required: true, unique: true,
      validate: [
        function(input) {
          return /[a-zA-Z0-9_]{1,15}/.test(input)
        },
        'Handle must be between 1 and 15 characters and contain only letters, numbers, and underscores.'
      ] 
    }
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
  status:{
    type: String,
    enum: ["online", "offline", "away", "busy"],
    default: "online"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {timestamps: true}
) 

UserSchema.index({userId: 1})
UserSchema.index({handle: 1})
UserSchema.index({display: 1})
UserSchema.index({email: 1})


export default model('User', UserSchema);