import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('Invalid email').max(320),
  message: z.string().trim().min(1, 'Message is required').max(5000),
  company: z.string().trim().max(200).optional().default(''),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email('Invalid email').max(320).transform((e) => e.toLowerCase()),
});

export const searchSchema = z.object({
  q: z.string().trim().max(200).optional().default(''),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
