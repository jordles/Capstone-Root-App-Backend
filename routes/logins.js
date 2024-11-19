import { Router } from 'express';
import Login  from '../models/Login.js';
import User from '../models/User.js';
const router = Router();

/**
 * GET /api/logins
 * @description Get all logins accessible only from admin key
 */

router.get('/all', async (_req, res) => {
  try{
    const logins = await Login.find({});
    if(!logins) return res.status(404).json({ error: 'No logins found' });
    res.json(logins.length == 1 ? logins[0] : logins);
  }
  catch(err){
    res.status(400).send(err.message);
  }
  
});

/**
 * GET /api/logins/:id
 * @description Get a specific login
 */

router.get('/:id', async (req, res) => {
  try{
    const login = await Login.findById(req.params.id);
    if(!login) return res.status(404).json({ error: 'No login found' });
    res.json(login);
  }
  catch(err){
    res.status(400).send(err.message);
  }
  
});


//Admins should not have the power to alter the sensitive info other than the user itself. 

/**
 * DELETE /api/logins/:id
 * @description Delete a login
 * Admins do have the power to delete a user and their login info
 */

router.delete('/:id', async (req, res) => {
  try{
    const login = await Login.findByIdAndDelete(req.params.id);
    if(!login) return res.status(404).json({ error: 'No login found' });

    const user = await User.findByIdAndDelete(login.user);
    if(!user) return res.status(404).json({ error: 'No user found' });
    res.json(login);
  }
  catch(err){
    res.status(400).send(err.message);
  }
  
})
export default router;