import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Login from '../models/Login.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is valid in Login collection
    const login = await Login.findOne({
      token,
      isValid: true
    });
    
    if (!login) {
      throw new Error('Session expired');
    }
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }
    
    // Update last active timestamp
    login.lastActive = new Date();
    await login.save();
    
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

export default auth;