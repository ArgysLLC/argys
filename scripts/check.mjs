import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import assert from 'node:assert/strict';
import './build.mjs';

const dist = resolve(import.meta.dirname, '../dist');
const pages = (await readdir(dist)).filter(file => file.endsWith('.html'));
const documents = new Map(await Promise.all(pages.map(async page => [page, await readFile(join(dist, page), 'utf8')])));
let checked = 0;
for (const [page, html] of documents) {
  assert(!html.includes('{{'), `${page}: unresolved template`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page}: must have exactly one H1`);
  assert(html.includes('<html lang="en">'), `${page}: missing language`);
  assert(html.includes('id="main"'), `${page}: missing main target`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${page}: duplicate IDs`);
  for (const match of html.matchAll(/<(?:a|link|script|img)\b[^>]*\b(?:href|src)="([^"]+)"/g)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|data:)/.test(href)) continue;
    assert(href !== '#', `${page}: empty link`);
    const [path, fragment] = href.split('#');
    const file = resolve(dist, dirname(page), decodeURIComponent(path || page));
    assert(file.startsWith(dist + '/'), `${page}: reference outside deployment`);
    assert((await stat(file)).isFile(), `${page}: missing ${href}`);
    if (fragment && file.endsWith('.html')) {
      const target = await readFile(file, 'utf8');
      assert(target.includes(`id="${decodeURIComponent(fragment)}"`), `${page}: missing anchor ${href}`);
    }
    checked++;
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) assert(/\balt="[^"]*"/.test(match[0]), `${page}: image without alternative text`);
}
const allowed = new Set([...pages, 'assets', 'styles', 'scripts', '.nojekyll', 'robots.txt', 'sitemap.xml']);
for (const file of await readdir(dist)) assert(allowed.has(file), `Unexpected deployment file: ${file}`);
const config = JSON.parse(await readFile(resolve(dist, '../content/site.json'), 'utf8'));
const contact = documents.get('contact.html');
for (const email of [config.contactEmail, config.leadershipEmail]) {
  assert(contact.includes(`href="mailto:${email}?subject=`), `Missing working email link: ${email}`);
  assert(contact.includes(`data-copy-email="${email}"`), `Missing copy email: ${email}`);
}
const configuredUrl = process.env.SITE_URL || config.siteUrl;
if (configuredUrl) {
  const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
  assert(sitemap.includes(configuredUrl.replace(/\/$/, '') + '/technology.html'), 'Incorrect sitemap base path');
  const expectedBase = new URL(configuredUrl.replace(/\/?$/, '/')).pathname;
  assert(documents.get('404.html').includes(`<base href="${expectedBase}">`), 'Incorrect 404 base path');
}
console.log(`Passed: ${pages.length} pages, ${checked} local references, anchors, image descriptions, email actions and deployment contents.`);
