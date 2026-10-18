import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const mechanics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/mechanics' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    lastUpdated: z.string().optional(),
  }),
});

const notices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notices' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    category: z.enum(['Updates', 'Developer Notes', 'Notice', 'Maintenance', 'Event']).default('Notice'),
    description: z.string().optional(),
    coverImage: z.string().optional(),
    version: z.string().optional(),
    author: z.string().optional().default('Dev Team'),
    pinned: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { mechanics, notices };
