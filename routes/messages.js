import { Router } from 'express';
import Mongoose from 'mongoose';
import User from '../models/User.js';
import Message from '../models/Message.js';
const router = Router();

/**
 * GET /api/messages/conversation/:sender/:recipient
 * @description Get chat history between two users
 */
router.get('/conversation/:sender/:recipient', async (req, res) => {
  try {
    const { sender, recipient } = req.params;

    if (!sender || !recipient) {
      return res.status(400).json({ error: "Both sender and recipient must be provided" });
    }

    //find all messages between these two users
    const messages = await Message.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender }
      ]
    }).sort({ 'createdAt': -1 });
    
    if (messages.length === 0) {
      return res.status(404).json({ error: "No messages found between these users" });
    }

    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})

/**
 * GET /api/users/conversations/:sender
 * @description Get all of sender's conversations
 * filters and outputs a list of users that the current user has had conversations with
 */

router.get('/conversations/:sender', async (req, res) => {
  try {
    const conversations = await Message.find({ 
      $or: [{ sender: req.params.sender }, { recipient: req.params.sender } ] 
    }).distinct('sender' || 'recipient');
    console.log('conversations', conversations);

    if (!conversations || conversations.length === 0) {
      return res.status(404).json({ error: "No conversations found for this user" });
    }

    const filteredConversations = conversations.filter(conv =>  conv.toString() !== req.params.sender); //to string to convert the ObjectId to a string to compare by proper data type
    res.json(filteredConversations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// router.get('/conversations/:sender', async (req, res) => {
//   try {
//     // const conversations = await Message.find({ sender: req.params.sender }).distinct('recipient');
//     const conversations = await Message.find({ 
//       $or: [{ sender: req.params.sender }, { recipient: req.params.sender } ] 
//     }).distinct('recipient');
//     if(!conversations) return res.status(404).json({ error: "No user with that _id" });
//     res.json(conversations);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

/**
 * GET /api/messages/unread/:userId
 * @description Get count of unread messages for a user
 */
router.get('/unread/:userId', async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.params.userId,
      read: false
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


/**
 * POST /api/messages
 * @description Send a new message
 */
router.post('/', async (req, res) => {
  try {
    // const sender = await User.findById(req.body.sender || req.query.sender).select('_id');
    // if(!sender) return res.status(404).json({error: "No sender with that _id"});

    // const recipient = await User.findById(req.body.recipient || req.query.recipient).select('_id');
    // if(!recipient) return res.status(404).json({error: "No recipient with that _id"});
    // const message = await Message.create(req.body);


    const { sender, recipient, content } = req.body;

    // Validate users exist
    const [senderUser, recipientUser] = await Promise.all([
      User.findById(sender),
      User.findById(recipient)
    ]);

    if (!senderUser || !recipientUser) {
      return res.status(404).json({ error: "Sender or recipient not found" });
    }

    // Create and save the message
    const message = await Message.create({
      sender,
      recipient,
      content
    });

    // Populate user details before sending response
    await message.populate('sender', 'name profilePicture');
    await message.populate('recipient', 'name profilePicture');

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PATCH /api/messages/:id/read
 * @description Mark a message as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    // // Toggle the 'read' flag
    // message.read = !message.read;
    message.read = true;
    await message.save();
    
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/messages/:id
 * @description Delete a message
 */
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;