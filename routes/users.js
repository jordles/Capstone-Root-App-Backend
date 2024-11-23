import { Router } from 'express';
import User from '../models/User.js';
import Login from '../models/Login.js';
import Post from '../models/Post.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/email.js';
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
});

// /**
//  * GET /api/users/:id/conversations
//  * @description Get a user's conversations 
//  * outputs a list of users that the current user has had conversations with
//  */

// router.get('/:id/conversations', async (req, res) => {
//   try {
//     const conversations = await User.findById(req.params.id).populate('conversations').select('conversations');
//     if(!conversations) return res.status(404).json({ error: "No user with that _id" });
//     res.json(conversations);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

/**
 * GET /api/users/profile/:handle
 * @description Get a user's profile by their handle
 * Used by anyone to view a user's profile page
 */

router.get('/profile/:handle', async (req, res) => {
  try {
    const user = await User.findOne({'name.handle': req.params.handle})
      .populate({
        path: 'followers following',
        select: 'profilePicture bio'
      })
      .populate('posts');
    if(!user) return res.status(404).json({ error: "No user with that handle" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/users/:id/login
 * @description Get a user's login info (Only logged in users can see their own login info)
 */

router.get('/:id/login', async (req, res) => {
  try {
    const login = await Login.findOne({ user: req.params.id })
      .select('username email lastActive');
    if(!login) return res.status(404).json({ error: "No login with that _id" });
    res.json(login);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/users/suggestions/:userId
 * @description Get user suggestions (users not being followed by the current user)
 */
router.get('/suggestions/:userId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get users that the current user is not following
    // Exclude the current user and users they already follow
    const suggestions = await User.find({
      _id: { 
        $nin: [
          currentUser._id, 
          ...(currentUser.following || [])
        ]
      }
    })
    .select('name profilePicture bio') // Only select necessary fields
    .limit(5); // Limit to 5 suggestions

    res.json(suggestions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/users/:userId/follow
 * @description Follow/Unfollow a user
 */
router.post('/:userId/follow', async (req, res) => {
  try {
    const { userToFollowId } = req.body;
    const currentUserId = req.params.userId;

    // Check if both users exist
    const [currentUser, userToFollow] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userToFollowId)
    ]);

    if (!currentUser || !userToFollow) {
      return res.status(404).json({ error: "One or both users not found" });
    }

    // Check if already following
    const isFollowing = currentUser.following.includes(userToFollowId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: userToFollowId }
      });
      await User.findByIdAndUpdate(userToFollowId, {
        $pull: { followers: currentUserId }
      });
      res.json({ message: "User unfollowed successfully" });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: userToFollowId }
      });
      await User.findByIdAndUpdate(userToFollowId, {
        $addToSet: { followers: currentUserId }
      });
      res.json({ message: "User followed successfully" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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
 * -----------------------------------------------
 * We are checking credentials through the logins database, nothing new is being created
 */

router.post('/login', async (req, res) => {
  try {
    const { userEmail, password } = req.body;

    const login = await Login.findOne({
      $or: [{ username: userEmail }, { email: userEmail }]
    });
    
    const isMatch = await login.matchPassword(password);
    if (!login || !isMatch) {
      return res.status(401).json({ error: 'Invalid username, email or password' });
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
 * POST /api/users/forgot-password
 * @description Request password reset email
 * generates a reset token, stores it in the database and sends it in an email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const login = await Login.findOne({ email });
    
    if (!login) {
      return res.status(404).json({ error: 'No account with that email exists' });
    }

    // Generate reset token
    const resetToken = login.createResetToken();
    await login.save();

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/users/reset-password/:token
 * @description Reset password using token
 * verify the reset token, update the password and clear the reset token
 */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    // Hash the token from params to compare with stored hash to verify token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find login with valid token
    const login = await Login.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!login) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token
    login.password = password;
    login.resetToken = undefined;
    login.resetTokenExpiry = undefined;
    await login.save();

    res.json({ message: 'Password reset successful' });
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

    const user = await User.findByIdAndDelete(login.user);

    //if other databases cannot find the user, it will return null and make the handle conversion be @deletedUser
    
    res.json({deletedUser: user, deletedLogin: login});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;