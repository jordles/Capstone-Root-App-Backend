import { Router } from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';
const router = Router();

/**
 * /api/messages/:id/
 * @description See Chat History with a 
 */

router.get('/conversation', async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    console.log(req.query);
    if (!user1 || !user2) {
      return res.status(400).json({ error: "Both user1 and user2 must be provided" });
    }
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 }
      ]
    }).sort('createdAt');
  
    if (messages.length === 0) {
      return res.status(404).json({ error: "No messages found between these users" });
    }
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})

// Send message
router.post('/', async (req, res) => {
  try {

    const sender = await User.findById(req.body.sender || req.query.sender).select('_id');
    if(!sender) return res.status(404).json({error: "No sender with that _id"});

    const recipient = await User.findById(req.body.recipient || req.query.recipient).select('_id');
    if(!recipient) return res.status(404).json({error: "No recipient with that _id"});
    const message = await Message.create(req.body);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error:', error); // Add this line for debugging
    res.status(400).json({ error: error.message });
  }
});


/**
 * PATCH /api/messages/:id/
 * @description Mark message as read
 */
// Mark message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    // Toggle the 'read' flag
    message.read = !message.read;
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;