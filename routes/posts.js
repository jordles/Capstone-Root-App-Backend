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
 * POST api/posts/:id/like
 * @description like / unlike a post
 */

router.post('/:id/like', async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({error: "No post with that _id"});
    const user = await User.findById(req.body.user || req.query.user);
    if(!user) return res.status(404).json({error: "No user with that _id"});

    if(!post.likes.includes(user._id)){
      post.likes.push(user._id);
      await post.save();
      res.status(200).json({message: `Post liked by @${user.name.handle}`, post});
    }
    else{
      post.likes.pull(user._id);
      await post.save();
      res.status(200).json({message: `Post unliked by @${user.handle}`, post});
    }
    
  }
  catch(err){
    res.status(400).json({error: err.message});
  }
})

/**
 * POST api/posts/:id/comment
 * @description Add a comment to a post
 */

router.post('/:id/comment', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({ error: "No post with that _id" });
    post.comments.push(req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PATCH api/posts/:id/comment
 * @description Update a comment to a post
 */

router.patch('/:id/comment', async (req, res) => {
  try{
    const user = await User.findById(req.body.user || req.query.user);
    if(!user) return res.status(404).json({ error: "No user with that _id" });
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({ error: "No post with that _id" });
    post.comments.map(comment => {
      if(comment.user == req.body.user || comment.user == req.query.user){
        comment.content = req.body.content;
      }
    })
    await post.save();
    res.json(post);
  }
  catch(err){
    res.status(400).json({error: err.message});
  }
})

/**
 * PATCH api/posts/:id
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