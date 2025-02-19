import express, { Request, Response } from 'express';
import v1Routes from './routes/v1/index.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Version 1 routes
app.use('/v1', v1Routes);

// Redirect root to latest API version
app.get('/', (req: Request, res: Response) => {
  res.redirect('/v1');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;