import { Router } from 'express';
import User from '../models/User.js';
import Login from '../models/Login.js';
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

    const login = await Login.create({
      user: user._id,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });

    res.status(201).json({newUser: user, newLogin: login});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const login = await Login.findOne({ email: req.body.email });
    const isMatch = await login.matchPassword(req.body.password);
    if (!login || !isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json(login);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update User Settings

router.patch('/settings:id', async (req, res) => {
  try {
    const updatedLogin = await Login.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if(!updatedLogin) return res.status(404).json({ error: "No login with that _id" });
    res.json(updatedLogin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



export default router;