import { Router } from 'express';
import User from '../models/User.js';
import Login from '../models/Login.js';
import jwt from 'jsonwebtoken';

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
    // Create user 
    const user = await User.create(req.body);

    //Create JWT token for user authentication
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    //Create login database for user
    const login = new Login({
      user: user._id,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
    });
    await login.save();

    res.status(201).json({ createdUser: user, createdLogin: login });
  }
  catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { userEmail, password } = req.body;

    const login = await Login.findOne({
      $or: [{ username: userEmail }, { email: userEmail }]
    });

    console.log(login)
    if (!login || !(await login.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username, email or password' });
    }

    const user = await User.findById(login.user);
    console.log(user);
    if (!user || !user.isActive) {
      throw new Error('User account is inactive');
    }
    
    //Create JWT token for user authentication
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET); 
    
    // Update user's last login and login record
    user.lastLogin = new Date();
    login.lastActive = new Date();
    await Promise.all([user.save(), login.save()]);

    res.status(200).json({ token, user });
  }
  catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;