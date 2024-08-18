import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message:
    'Rate Limit Exceeded: Server can handle maximum 5 requests per second.',
});
