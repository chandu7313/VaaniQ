import { z } from 'zod';

// Shared request schemas used by more than one route file.
export const idParams = z.object({ id: z.string().uuid() });
export const profileBody = z.object({
  bedrooms: z.number().int().min(1).max(5).optional(),
  location: z.string().max(60).optional(),
  budgetMax: z.number().int().min(1000000).max(500000000).optional(),
  timelineMonths: z.number().positive().max(120).optional(),
  decisionMaker: z.enum(['self', 'joint', 'other']).optional(),
  purpose: z.enum(['self-use', 'investment']).optional(),
  preferences: z.array(z.string().max(40)).max(10).optional(),
}).strict();
export const phone = z.string().regex(/^\+91[6-9]\d{9}$/, 'phone must be +91 followed by a 10-digit mobile number');
