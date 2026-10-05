import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { preparePages, validatePages } from '../scripts/prepare-pages.mjs';

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'folio-pages-'));
  const source = path.join(root, 'source');
  const destination = path.join(root, 'site');
  mkdirSync(source);
  writeFileSync(path.join(source, 'index.html'), '<!doctype html><link rel="stylesheet" href="style.css"><h1>Portfolio</h1>');
  writeFileSync(path.join(source, 'style.css'), 'body{color:black}');
  return { root, source, destination };
}

test('prepares only static assets, excluding private neighboring files', () => {
  const f = fixture();
  try {
    writeFileSync(path.join(f.source, '.env'), 'PRIVATE_VALUE=sample');
    writeFileSync(path.join(f.source, 'site.sqlite'), 'sample');
    preparePages(f.source, f.destination);
    assert.deepEqual(readdirSync(f.destination).sort(), ['.nojekyll', 'index.html', 'style.css']);
    assert.doesNotThrow(() => validatePages(f.destination));
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('refuses extra files in the deployment folder', () => {
  const f = fixture();
  try {
    preparePages(f.source, f.destination);
    writeFileSync(path.join(f.destination, '.env'), 'PRIVATE_VALUE=sample');
    assert.throws(() => validatePages(f.destination));
    assert.throws(() => preparePages(f.source, f.destination));
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('refuses symlinks in generated assets', () => {
  const f = fixture();
  try {
    rmSync(path.join(f.source, 'style.css'));
    symlinkSync(path.join(f.source, 'index.html'), path.join(f.source, 'style.css'));
    assert.throws(() => preparePages(f.source, f.destination));
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
