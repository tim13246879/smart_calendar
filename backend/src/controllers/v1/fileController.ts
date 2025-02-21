import { Request, Response } from 'express';
import redisClient from '../../config/redis.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FILE_PROCESSING_PROMPT } from '../../utils/prompts.js';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    // Initialize Gemini client
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    if (!process.env.GEMINI_MODEL) {
      throw new Error('GEMINI_MODEL environment variable is not set');
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

    // Prepare all files for LLM in a single content array
    const content = [
      FILE_PROCESSING_PROMPT,
      ...req.files.map(file => ({
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype
        }
      }))
    ];

    // Query the LLM once with all files
    const result = await model.generateContent(content);
    const response = result.response.text();

    // If there's ICS content, send it as a file
    if (response.trim()) {
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename="events.ics"');
      res.send(response);
      
      // Still store the data in Redis, but don't wait for it
      const requestKey = `request:${Date.now()}`;
      const requestData = {
        uploadDate: new Date().toISOString(),
        response: response,
        files: req.files.map(file => ({
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          buffer: file.buffer.toString('base64')
        }))
      };
      redisClient.set(requestKey, JSON.stringify(requestData)).catch(console.error);
    } else {
      // If no events were found, return a 404
      res.status(404).json({ message: 'No calendar events found in the provided files' });
    }

  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({ error: 'Failed to process files' });
  }
}; 