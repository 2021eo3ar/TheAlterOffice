import express from 'express';
import { googleLogin, googleCallback, loginSuccess, logout } from '../controllers/authController.js';
import passport from '../config/googleAuth.js';

const router = express.Router();

// router.get('/google', googleLogin);
// router.get('/google/callback', googleCallback, loginSuccess);
router.get('/success', loginSuccess);
router.get('/logout', logout);

export default router;
