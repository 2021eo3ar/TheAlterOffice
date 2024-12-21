import express from 'express'
import createShortURL  from '../controllers/urlController.js';
import authMiddleware from '../middlewares/auth.Middleware.js';

const router = express.Router();

router.post('/shorten', authMiddleware, createShortURL);

export default router
