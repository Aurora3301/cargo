import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleSite, validateSite } from '../src/lib/model';
import { renderSite } from '../src/lib/publish';

test('sample site has a valid portable schema', () => {
  assert.deepEqual(validateSite(JSON.parse(JSON.stringify(sampleSite))), sampleSite);
});

test('rejects malformed imports and duplicate project IDs', () => {
  assert.throws(() => validateSite({ ...sampleSite, email: 'bad-email' }));
  assert.throws(() => validateSite({ ...sampleSite, projects: [sampleSite.projects[0], sampleSite.projects[0]] }));
  assert.throws(() => validateSite({ ...sampleSite, headline: 'x'.repeat(141) }));
});

test('published HTML escapes untrusted text and remains self-contained', () => {
  const html = renderSite({ ...sampleSite, headline: '<script>alert(1)</script>' });
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /<style>/);
});
