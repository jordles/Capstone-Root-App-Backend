import { Router } from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
const router = Router();

/**
 * GET api/posts
 * @description Get all posts accessible by admins only
 */
router.get('/all', async (req, res) => {
  try {
    const posts = await Post.find();
    if(!posts) return res.status(404).json({ error: 'No posts found' });
    res.json(posts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET api/posts/feed
 * @description Get all posts accessible by logged in users on the main feed page
 */
router.get('/feed', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'profilePicture')
      .populate('comments.user', 'username profilePicture')
      .sort('-createdAt');
    res.json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})

/**
 * GET api/posts/id/:id
 * @description Get a specific post by _id
 */
router.get('/id/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET api/posts/user/:id
 * @description Get all posts by a specific user
 */
router.get('/user/:id', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id });
    if(!posts) return res.status(404).json({ error: 'No posts found' });
    res.json(posts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
})

/**
 * POST api/posts/add
 * @description Add a new post
 */

router.post('/add', async (req, res) => {
  try {
    const newPost = await Post.create(req.body);

    const user = await User.findById(req.body.user);
    if(!user) return res.status(404).json({ error: "No user found" });
    user.posts.push(newPost._id);
    await user.save();

    res.status(201).json({newPost, addedPostIdOnUser: newPost._id});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Patch api/posts/:id
 * @description Update a post
 */

router.patch('/:id', async (req, res) => {
  try {
    
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if(!updatedPost) return res.status(404).json({ error: "No post with that _id" });
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*
 * DELETE api/posts/:id
 * @description Delete a post
 */

router.delete('/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if(!deletedPost) return res.status(404).json({ error: "No post with that _id" });

    const user = await User.findById(deletedPost.user);
    if(!user) return res.status(404).json({ error: "No user with that _id" });
    user.posts.pull(deletedPost._id);
    await user.save();
    
    res.json({deletedPost, deletedPostIdOnUser: deletedPost._id});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router