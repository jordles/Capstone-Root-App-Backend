// Schema for Login Sensitive Data regarding the User
// Certain data is accessible by only admins and also users themselves
import {Schema, model} from 'mongoose';
import bcrypt from 'bcryptjs'; // more for heavy encryption
import crypto from 'crypto'; // more for quick temporary encryption

const loginSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true
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
  lastActive: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  resetToken: String,
  resetTokenExpiry: Date
}, {
  timestamps: true,
});

// this function will call bcrypt to hash the password before saving to the database
// save hook does not apply to findOneAndUpdate

loginSchema.pre('save', async function(next) {
  if (this.isModified('password')) { 
    const salt = await bcrypt.genSalt(10);
    //if the password has modified; we need this condition to prevent unnecessary hashing
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// For findOneAndUpdate
loginSchema.pre('findOneAndUpdate', async function () {
  let update = {...this.getUpdate()};

  // Only run this function if password was modified
  if (update.password){
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(this.getUpdate().password, salt);
    this.setUpdate(update);
  }
})

//this function will be called when the user logs in, to check if the bcrypted password matches the hashed password in the database
loginSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

// creating reset token
loginSchema.methods.createResetToken = function() {
  // Create a random token of random bytes
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash it as sha256 and store in database
  this.resetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Token expires in 30 minutes
  this.resetTokenExpiry = Date.now() + 30 * 60 * 1000;
  
  // Store the hashed token in the database
  // Send original unhashed token (will be sent via email)

  // The token's purpose is to verify: 
  // The person has access to the registered email account (because they have to login to reset their password)
  return resetToken;
};

loginSchema.index({user: 1})

export default model('Login', loginSchema)