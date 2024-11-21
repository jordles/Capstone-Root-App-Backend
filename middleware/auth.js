import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Login from '../models/Login.js';

const auth = async (req, res, next) => {
  try {
    
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
    
    // Check for valid session in Login collection
    const login = await Login.findOne({
      user: user._id,
      isValid: true
    });
    
    if (!login) {
      throw new Error('Session expired');
    }
    
    // Update last active timestamp
    login.lastActive = new Date();
    await login.save();
    
    req.token = token;
    req.user = user;
    req.login = login;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

export default auth;