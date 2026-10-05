import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(root, 'hosting', 'dist');
const files = ['index.html', 'style.css'];

try {
  const envFile = path.join(root, '.env');
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const source = process.env.PUBLISH_DIR || path.join(root, 'published');
  for (const name of files) {
    const file = path.join(source, name);
    if (!existsSync(file) || !lstatSync(file).isFile() || lstatSync(file).isSymbolicLink()) {
      throw new Error('Generate the static site in the editor before preparing hosting.');
    }
  }
  const html = readFileSync(path.join(source, 'index.html'), 'utf8');
  if (!html.toLowerCase().includes('<!doctype html>') || !html.includes('style.css')) {
    throw new Error('The published HTML is incomplete. Generate the static site again.');
  }
  mkdirSync(destination, { recursive: true });
  for (const name of files) copyFileSync(path.join(source, name), path.join(destination, name));
  console.log('Prepared hosting/dist/index.html and hosting/dist/style.css. Deployment is a separate step.');
} catch (error) {
  console.error(error instanceof Error && error.message.startsWith('Generate') ? error.message : 'Unable to prepare hosting. Check the generated files and local permissions.');
  process.exitCode = 1;
}
