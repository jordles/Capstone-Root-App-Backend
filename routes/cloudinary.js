import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// Delete a file from Cloudinary
router.post('/delete', async (req, res) => {
  try {
    const { publicId, resourceType } = req.body;
    
    console.log('Received delete request:', { publicId, resourceType });
    
    if (!publicId || !resourceType) {
      return res.status(400).json({ error: 'Missing publicId or resourceType' });
    }

    // Delete the file from Cloudinary
    console.log('Attempting to delete from Cloudinary with:', { publicId, resourceType });
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log('Cloudinary delete result:', result);
    
    if (result.result === 'ok') {
      res.json({ message: 'File deleted successfully' });
    } else {
      console.error('Failed to delete from Cloudinary:', result);
      res.status(500).json({ error: 'Failed to delete file from Cloudinary', details: result });
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', {
      message: error.message,
      stack: error.stack,
      details: error.response?.data
    });
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message,
      details: error.response?.data 
    });
  }
});

export default router;
