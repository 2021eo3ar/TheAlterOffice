import express from 'express';
import { 
  getURLAnalytics, 
  getTopicAnalytics, 
  getOverallAnalytics,
} from '../controllers/analyticsController.js';
import { ensureAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();


// Get Topic-Based Analytics
router.get('/topic/:topic', ensureAuthenticated, getTopicAnalytics);

// Get Overall Analytics
router.get('/overall', ensureAuthenticated, getOverallAnalytics);

// Get URL Analytics
router.get('/:alias', ensureAuthenticated, getURLAnalytics);

export default router;
