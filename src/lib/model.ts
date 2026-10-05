import { z } from 'zod';

const text = (max: number) => z.string().trim().min(1, 'This field is required').max(max);
const optionalText = (max: number) => z.string().trim().max(max);

export const projectSchema = z.object({
  id: z.string().uuid(),
  title: text(80),
  category: text(50),
  year: z.string().regex(/^\d{4}$/, 'Use a four-digit year'),
  description: text(240),
  color: z.enum(['sage', 'clay', 'lilac', 'sand']),
});

export const siteSchema = z.object({
  version: z.literal(1),
  siteName: text(60),
  eyebrow: optionalText(80),
  headline: text(140),
  introduction: text(400),
  aboutTitle: text(80),
  aboutBody: text(1000),
  email: z.string().trim().email('Enter a valid email address').max(150),
  projects: z.array(projectSchema).max(12, 'Keep up to 12 projects').refine(
    (items) => new Set(items.map((item) => item.id)).size === items.length,
    'Project IDs must be unique',
  ),
});

export type Site = z.infer<typeof siteSchema>;
export type Project = z.infer<typeof projectSchema>;

export const sampleSite: Site = {
  version: 1,
  siteName: 'Jade Studio — sample',
  eyebrow: 'Independent designer · sample content',
  headline: 'Thoughtful design for a more human world.',
  introduction: 'I shape identities and digital experiences with a quiet sense of purpose. This is sample content—replace or delete it before publishing.',
  aboutTitle: 'A little about me',
  aboutBody: 'I am a multidisciplinary designer drawn to clear ideas, tactile details, and useful things. This sample biography is here to show the layout; make it yours.',
  email: 'hello@example.com',
  projects: [
    { id: '9f87df56-523d-4b1d-a76d-2f73f1d76225', title: 'Botanic Notes', category: 'Brand identity', year: '2025', description: 'A warm visual identity for an imagined botanical journal. Sample project.', color: 'sage' },
    { id: '9f87df56-523d-4b1d-a76d-2f73f1d76226', title: 'Form & Field', category: 'Art direction', year: '2024', description: 'An editorial concept about everyday materials. Sample project.', color: 'clay' },
  ],
};

export function validateSite(value: unknown): Site {
  return siteSchema.parse(value);
}
