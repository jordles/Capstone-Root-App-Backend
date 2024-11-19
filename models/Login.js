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

//this function will call bcrypt to hash the password before saving to the database

loginSchema.pre('save', async function(next) {
  if (this.isModified('password')) { 
    const salt = await bcrypt.genSalt(10);
    //if the password has modified; we need this condition to prevent unnecessary hashing
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

//this function will be called when the user logs in, to check if the bcrypted password matches the hashed password in the database
loginSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


loginSchema.index({user: 1})

export default model('Login', loginSchema)