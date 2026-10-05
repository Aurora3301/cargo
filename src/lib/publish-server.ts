import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Site } from './model';
import { publishedCss, renderSite } from './publish';

export function publishSite(site: Site): string {
  const folder = process.env.PUBLISH_DIR || path.join(process.cwd(), 'published');
  mkdirSync(folder, { recursive: true });
  writeFileSync(path.join(folder, 'style.css'), publishedCss, { mode: 0o644 });
  writeFileSync(path.join(folder, 'index.html'), renderSite(site, 'style.css'), { mode: 0o644 });
  return folder;
}
