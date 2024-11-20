import { Router } from 'express';
import User from '../models/User.js';
import Login from '../models/Login.js';
import Post from '../models/Post.js';
const router = Router();

//get all users accessible only from admin key

/**
 * GET /api/users/all
 * @description Get all users accessible only from admin key
 */
router.get('/all', async (req, res) => {
  try {
    const users = await User.find()
      .populate({
        path: 'followers following',
        select: 'profilePicture bio'
      }, 'posts');
    
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

/**
 * GET /api/users/:id
 * @description Get a user
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'followers following',
        select: 'profilePicture bio'
      })
      .populate('posts');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
})

/**
 * POST /api/users/register
 * @description Register a user (through a form)
 */
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

/**
 * POST /api/users/login
 * @description Login a user (through a form)
 */

router.post('/login', async (req, res) => {
  try {
    const login = await Login.findOne({ email: req.body.email });
    const isMatch = await login.matchPassword(req.body.password);
    if (!login || !isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = await User.findById(login.user);
    // Update user's last login and login record
    user.lastLogin = new Date();
    login.lastActive = new Date();
    await Promise.all([user.save(), login.save()]);

    res.json(login);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/users/settings/:id
 * @description Update a users Login settings
 * -----------------------------------------------
 * Find by login id and update the login
 * If there is an email change, update the user database as well
 */
router.patch('/settings/:id', async (req, res) => {
  try {
    const loginId = await Login.findOne({ user: req.params.id }).select('_id');

    const updatedLogin = await Login.findByIdAndUpdate(
      loginId || req.params.id, 
      req.body, 
      {new: true}
    ); 
    
    const updatedUser = await User.findByIdAndUpdate(
      updatedLogin.user || req.params.id, 
      {$set: {}}, //set ensures any existing keys are preserved
      {new: true}
    );
    console.log('User', updatedUser);
    //since our user schemas has a nested object, we have to do this to update it
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        const value = req.body[key];
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Update nested objects
          Object.assign(updatedUser.name, value);
        } else {
          // Update simple fields
          updatedUser[key] = value;
        }
      }
    }
    await updatedUser.save();
    if(!updatedLogin && !updatedUser) return res.status(404).json({ error: "Cannot find login or user with that _id" });

    res.json({updatedUser, updatedLogin});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/users/:id
 * @description Delete a user
 */
router.delete('/:id', async (req, res) => {
  try {
    const login = await Login.findByIdAndDelete(req.params.id);
    if(!login) return res.status(404).json({ error: "No login with that _id" });
    res.json(login);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



export default router;