import { Request, Response } from 'express';
import redisClient from '../../config/redis.js';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileKey = `file:${Date.now()}-${req.file.originalname}`;
    const fileData = {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer.toString('base64'), // Convert buffer to base64 string
      uploadDate: new Date().toISOString()
    };

    await redisClient.set(fileKey, JSON.stringify(fileData));

    res.status(201).json({
      message: 'File uploaded successfully',
      fileId: fileKey,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}; 