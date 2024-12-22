import passport from 'passport';

export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleCallback = passport.authenticate('google', {
  failureRedirect: '/login',
});

export const loginSuccess = (req, res) => {
  if (req.user) {
    res.status(200).json({
      message: 'Login successful',
      user: req.user,
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
