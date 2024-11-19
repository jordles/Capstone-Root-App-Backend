import { Router } from 'express';
import User from '../models/User.js';
import Login from '../models/Login.js';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
const router = Router();

//get all users accessible only from admin key
router.get('/all', async (req, res) => {
  try {
    const users = await User.find()
      .populate({
        path: 'followers following',
        select: 'profilePicture bio'
      });
    
    // Get login info for each user
    const usersWithLogin = await Promise.all(
      users.map(async (user) => {
        const login = await Login.findOne({ user: user._id })
          .select('username email lastActive');
        return {
          ...user.toJSON(),
          loginInfo: login
        };
      })
    );
    
    res.json(usersWithLogin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register User
router.post('/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {

export default router;