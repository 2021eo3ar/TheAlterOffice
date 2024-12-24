import express from 'express';
import { googleLogin, googleCallback, loginSuccess, logout } from '../controllers/authController.js';
import passport from '../config/googleAuth.js';

const router = express.Router();

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback, loginSuccess);
router.get('/logout', logout);
router.get("/g-login", (req, res)=>{
    res.send(`<a href="http://localhost:5000/auth/google">Google login</a>`)
})

export default router;
