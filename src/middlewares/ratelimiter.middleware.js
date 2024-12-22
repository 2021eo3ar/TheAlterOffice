import rateLimit from 'express-rate-limit';

export const createRateLimiter = (windowMs, max) =>
  rateLimit({
    windowMs,
    max,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
