// Schema for Login Sensitive Data regarding the User
// Certain data is accessible by only admins and also users themselves
import {Schema, model} from 'mongoose';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const loginSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
});


loginSchema.index({user: 1})

export default model('Login', loginSchema)