import express from 'express';
import { welcome } from '../../controllers/v1/homeController.js';

const router = express.Router();

// Base route for v1 API
router.get('/', welcome);

// Add more route groups here as needed
// Example:
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);

export default router;
