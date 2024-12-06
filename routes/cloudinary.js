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
    
    if (!publicId || !resourceType) {
      return res.status(400).json({ error: 'Missing publicId or resourceType' });
    }

    // Delete the file from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    
    if (result.result === 'ok') {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete file from Cloudinary' });
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
