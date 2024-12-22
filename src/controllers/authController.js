import passport from 'passport';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Secret for JWT (use a secure secret in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Function to generate JWT
const generateToken = (user) => {
  const payload = { id: user.id, email: user.email }; // You can customize the payload
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token will expire in 1 hour
};

export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleCallback = passport.authenticate('google', {
  failureRedirect: '/login',
});

export const loginSuccess = (req, res) => {
  if (req.user) {
    // Generate JWT token
    const token = generateToken(req.user);

    // Send the token in the response
    res.status(200).json({
      message: 'Login successful',
      user: req.user,
      token: token, // Send the token as part of the response
    });
  } else {
    res.status(403).json({ message: 'Not authenticated' });
  }
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.status(200).json({ message: 'Logged out successfully' });
  });
};
