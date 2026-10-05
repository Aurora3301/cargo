import { defineConfig } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

const testRoot = path.join(os.tmpdir(), `folio-local-e2e-${process.pid}`);

export default defineConfig({
  testDir: './e2e',
  retries: 0,
  use: { baseURL: 'http://127.0.0.1:3100', browserName: 'chromium', headless: true },
  webServer: { command: 'npm run dev -- -p 3100', url: 'http://127.0.0.1:3100', reuseExistingServer: false, timeout: 120_000,
    env: { DATABASE_PATH: path.join(testRoot, 'site.sqlite'), PUBLISH_DIR: path.join(testRoot, 'published') } },
});
