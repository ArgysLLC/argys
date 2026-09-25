import { readFile, writeFile, mkdir, cp, readdir, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const src = join(root, 'site');
const dist = join(root, 'dist');
const config = JSON.parse(await readFile(join(root, 'content/site.json'), 'utf8'));
config.siteUrl = process.env.SITE_URL || config.siteUrl;
if (config.siteUrl && !/^https?:\/\//.test(config.siteUrl)) throw new Error('SITE_URL must be an absolute HTTP(S) URL');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
for (const key of ['contactEmail','leadershipEmail']) if (config[key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config[key])) throw new Error(`Invalid ${key}`);
const nav = [['products.html','Products'],['technology.html','Technology'],['company.html','Company'],['contact.html','Connect']];
await rm(dist, {recursive:true, force:true});
await mkdir(dist, {recursive:true});
for (const directory of ['assets','styles','scripts']) await cp(join(src,directory),join(dist,directory),{recursive:true});
const pages = (await readdir(src)).filter(file => file.endsWith('.html'));
for (const page of pages) {
 let html = await readFile(join(src,page),'utf8');
 if (html.includes('{{VESSEL_SCENE}}')) html = html.replaceAll('{{VESSEL_SCENE}}', await readFile(join(src, 'partials/vessel-scene.html'), 'utf8'));
 const header = `<a class="skip-link" href="#main">Skip to content</a><header class="site-header" data-header><a class="brand" href="index.html" aria-label="Argys home"><img src="assets/argys-logo.png" width="756" height="416" alt="Argys | Vision in Surgery"></a><nav class="desktop-nav" aria-label="Main navigation">${nav.map(([url,label])=>`<a href="${url}" ${page===url?'aria-current="page"':''} class="${url==='contact.html'?'nav-cta':''}">${label}</a>`).join('')}</nav><button class="menu-toggle" aria-controls="mobile-nav" aria-expanded="false"><span>Menu</span><i aria-hidden="true"></i></button><nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden>${nav.map(([url,label])=>`<a href="${url}" ${page===url?'aria-current="page"':''}>${label}</a>`).join('')}</nav></header>`;
 const footer = `<footer class="site-footer"><div class="footer-top"><a class="brand" href="index.html" aria-label="Argys home"><img src="assets/argys-logo.png" width="756" height="416" loading="lazy" alt="Argys | Vision in Surgery"></a><p>Intelligence in the instrument.<br>Possibility in the surgeon’s hands.</p><a class="text-link" href="${escape(config.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn <span class="sr-only"> (opens in a new tab)</span></a></div><div class="footer-bottom"><span>© ${config.year} ${escape(config.legalName)}</span><div><a href="sources.html">Sources &amp; credits</a><a href="privacy.html">Privacy</a></div><span>Technology in development</span></div></footer>`;
 const contact = config.contactEmail ? `<a class="button button-dark" href="mailto:${escape(config.contactEmail)}">Email Argys </a><a class="contact-email" href="mailto:${escape(config.contactEmail)}">${escape(config.contactEmail)}</a>` : `<a class="button button-dark" href="${escape(config.linkedin)}" target="_blank" rel="noopener noreferrer">Connect on LinkedIn <span class="sr-only"> (opens in a new tab)</span></a>`;
 html = html.replaceAll('{{HEADER}}',header).replaceAll('{{FOOTER}}',footer).replaceAll('{{CONTACT_ACTION}}',contact).replaceAll('{{BUSINESS_EMAIL}}',escape(config.contactEmail)).replaceAll('{{LEADERSHIP_EMAIL}}',escape(config.leadershipEmail));
 if (page === '404.html') {
  const basePath = config.siteUrl ? new URL(config.siteUrl.replace(/\/?$/, '/')).pathname : '/';
  html = html.replace('<head>',`<head><base href="${escape(basePath)}">`);
 }
 if (config.siteUrl) {
  const canonical = new URL(page==='index.html'?'':page,config.siteUrl.endsWith('/')?config.siteUrl:config.siteUrl+'/').href;
  html = html.replace('</head>',`<link rel="canonical" href="${escape(canonical)}"><meta property="og:url" content="${escape(canonical)}"></head>`);
 }
 await writeFile(join(dist,page),html);
}
await writeFile(join(dist,'.nojekyll'),'');
if(config.siteUrl){
 const origin=config.siteUrl.replace(/\/$/,'');
 await writeFile(join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p=>p!=='404.html').map(p=>`<url><loc>${escape(origin+'/'+(p==='index.html'?'':p))}</loc></url>`).join('')}</urlset>`);
 await writeFile(join(dist,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
} else await writeFile(join(dist,'robots.txt'),'User-agent: *\nAllow: /\n');
console.log(`Built ${pages.length} pages in dist. Private planning files are excluded.`);
