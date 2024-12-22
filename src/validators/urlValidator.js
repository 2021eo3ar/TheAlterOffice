import { body, validationResult } from 'express-validator';

export const validateURLRequest = [
  body('longUrl').isURL().withMessage('Invalid URL format'),
  body('customAlias')
    .optional()
    .isAlphanumeric()
    .withMessage('Custom alias must contain only letters and numbers'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
