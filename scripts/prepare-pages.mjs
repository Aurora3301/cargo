import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const allowedFiles = ['.nojekyll', 'index.html', 'style.css'];

/** @param {string} directory */
export function validatePages(directory) {
  if (lstatSync(directory).isSymbolicLink()) throw new Error('The Pages folder must not be a symlink.');
  const entries = readdirSync(directory).sort();
  if (JSON.stringify(entries) !== JSON.stringify(allowedFiles)) throw new Error('The Pages folder must contain only index.html, style.css, and .nojekyll.');
  for (const name of entries) {
    const stat = lstatSync(path.join(directory, name));
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Only regular static files can be published.');
  }
  const html = readFileSync(path.join(directory, 'index.html'), 'utf8');
  if (!html.toLowerCase().includes('<!doctype html>') || !html.includes('href="style.css"')) {
    throw new Error('Generate the static site again before publishing.');
  }
}

/** @param {string} source @param {string} destination */
export function preparePages(source, destination) {
  for (const name of ['index.html', 'style.css']) {
    const stat = lstatSync(path.join(source, name));
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Only regular static files can be published.');
  }
  if (existsSync(destination)) {
    if (lstatSync(destination).isSymbolicLink()) throw new Error('The Pages folder must not be a symlink.');
    if (readdirSync(destination).some((name) => !allowedFiles.includes(name))) throw new Error('Remove unexpected files from the Pages folder before publishing.');
    for (const name of readdirSync(destination)) {
      const stat = lstatSync(path.join(destination, name));
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Only regular static files can be published.');
    }
  }
  mkdirSync(destination, { recursive: true });
  for (const name of ['index.html', 'style.css']) copyFileSync(path.join(source, name), path.join(destination, name));
  writeFileSync(path.join(destination, '.nojekyll'), '');
  validatePages(destination);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  try {
    if (process.argv.includes('--check')) {
      validatePages(path.join(root, 'site'));
      console.log('Pages artifact validated: HTML and CSS only.');
    } else {
      const envFile = path.join(root, '.env');
      if (existsSync(envFile)) process.loadEnvFile(envFile);
      preparePages(process.env.PUBLISH_DIR || path.join(root, 'published'), path.join(root, 'site'));
      console.log('Prepared site/ for GitHub Pages. Commit and push site/ to deploy these changes.');
    }
  } catch {
    console.error('Pages preparation failed. Generate the static site first and check that site/ contains only regular index.html, style.css, and .nojekyll files.');
    process.exitCode = 1;
  }
}
