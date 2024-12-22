import express from 'express';
import { createShortURL, redirectShortURL } from '../controllers/urlController.js';
import { ensureAuthenticated } from '../middlewares/auth.Middleware.js';
import { validateURLRequest } from '../validators/urlValidator.js';

const router = express.Router();

router.post('/shorten', ensureAuthenticated, validateURLRequest, createShortURL);
router.get('/:alias', redirectShortURL);

export default router;
