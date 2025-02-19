import { Request, Response } from 'express';

export const welcome = (req: Request, res: Response) => {
  res.json({ message: 'Welcome to API V1!!' });
};