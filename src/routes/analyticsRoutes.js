import express from 'express';
import { getURLAnalytics } from '../controllers/analyticsController.js';
import { ensureAuthenticated } from '../middlewares/auth.Middleware.js';

const router = express.Router();

router.get('/:alias', ensureAuthenticated, getURLAnalytics);

export default router;
