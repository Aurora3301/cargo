import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getSite, saveSite } from '../src/lib/store';
import { publishSite } from '../src/lib/publish-server';

test('edit, save, reload, and publish static files', () => {
  const folder = mkdtempSync(path.join(os.tmpdir(), 'folio-local-test-'));
  const oldDatabase = process.env.DATABASE_PATH;
  const oldPublish = process.env.PUBLISH_DIR;
  process.env.DATABASE_PATH = path.join(folder, 'site.sqlite');
  process.env.PUBLISH_DIR = path.join(folder, 'public');
  try {
    const original = getSite();
    assert.match(original.siteName, /sample/);
    saveSite({ ...original, siteName: 'My Portfolio', headline: 'My own work' });
    assert.equal(getSite().headline, 'My own work');
    publishSite(getSite());
    assert.match(readFileSync(path.join(folder, 'public', 'index.html'), 'utf8'), /My own work/);
    assert.match(readFileSync(path.join(folder, 'public', 'style.css'), 'utf8'), /@media/);
  } finally {
    if (oldDatabase === undefined) delete process.env.DATABASE_PATH; else process.env.DATABASE_PATH = oldDatabase;
    if (oldPublish === undefined) delete process.env.PUBLISH_DIR; else process.env.PUBLISH_DIR = oldPublish;
    rmSync(folder, { recursive: true, force: true });
  }
});
