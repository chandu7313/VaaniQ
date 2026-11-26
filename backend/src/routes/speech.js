import { Router } from 'express';
import express from 'express';
import { z } from 'zod';
import { limiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { ah } from '../middleware/error.js';
import { transcribeAudio } from '../controllers/speech.controller.js';

const r = Router();
export const audioBody = express.raw({ type: 'audio/*', limit: '5mb' });
export const sttLimiter = limiter({ windowMs: 60 * 1000, limit: 30, message: 'Too many voice requests. Please wait a moment.' });
export const sttQuery = z.object({ language: z.enum(['en', 'hi', 'te']).optional() });

r.post('/transcribe', sttLimiter, audioBody, validate({ query: sttQuery }), ah(transcribeAudio));

export default r;
