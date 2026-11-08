import { z } from 'zod';

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email('Must be a valid email address.')
  .max(255, 'Email must be at most 255 characters.');

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100, 'Name must be at most 100 characters.'),
  email: emailField,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password must be at most 72 characters.'),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required.').max(72, 'Password must be at most 72 characters.'),
});
