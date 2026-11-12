// Prerenders every route to static HTML after `vite build`, and writes sitemap.xml, robots.txt
// and llms.txt. `pnpm build` runs it automatically; run it alone only on a fresh `vite build`.
//
// Env: VITE_BASE_PATH ("/" or "/repo/"), VITE_SITE_URL (absolute origin plus base, no trailing slash).
import type { DictionaryEntry } from '@adp/data';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type * as ServerEntry from '../src/entry-server';
import {
  browseHead,
  entryHead,
  headTags,
  homeHead,
  notFoundHead,
  staticHead,
  type PageHead,
} from '../src/seo/head';

const webDir = fileURLToPath(new URL('..', import.meta.url));
const dist = join(webDir, 'dist');
const serverDir = join(webDir, 'dist-server');
const basePath = process.env['VITE_BASE_PATH'] ?? '/';
const siteUrl = (
  process.env['VITE_SITE_URL'] ?? `https://giovanni-mattucci.github.io${basePath}`
).replace(/\/+$/, '');

if (!existsSync(join(dist, 'index.html'))) {
  console.error('prerender: dist/index.html missing; run vite build first');
  process.exit(1);
}
// Vite's template has an empty #root. A dist that was already prerendered does not, and filling it
// again would put the home page into every page, so refuse and ask for a fresh build.
const template = readFileSync(join(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) {
  console.error('prerender: dist/index.html is already prerendered; run vite build first');
  process.exit(1);
}

// 1. Build the server entry (fresh each run, deleted afterwards).
execSync(`pnpm exec vite build --ssr src/entry-server.tsx --outDir dist-server --emptyOutDir`, {
  cwd: webDir,
  stdio: 'inherit',
  env: { ...process.env, VITE_BASE_PATH: basePath },
});
const server = (await import(
  pathToFileURL(join(serverDir, 'entry-server.js')).href
)) as typeof ServerEntry;

// 2. Data.
const entries = JSON.parse(
  readFileSync(join(dist, 'data', 'dictionary.json'), 'utf8'),
) as DictionaryEntry[];
const grammarHtml = readFileSync(join(dist, 'data', 'grammar.html'), 'utf8');
const data = server.prepare(entries, grammarHtml);
const { letters, byLetter } = await data.dictionary;

// 3. Routes to render.
const pages: PageHead[] = [
  homeHead(entries.length, siteUrl),
  staticHead('/browse'),
  staticHead('/grammar'),
  staticHead('/about'),
  ...letters.map((l) => browseHead(l, byLetter.get(l)?.length ?? 0)),
  ...entries.map((e) => entryHead(e, siteUrl)),
];

// "<path>.html" is served for "/<path>" by GitHub Pages and by vite preview without a redirect.
function outputFile(path: string): string {
  return path === '/' ? join(dist, 'index.html') : join(dist, `${path.slice(1)}.html`);
}

/**
 * Fills the Vite template with one page's head tags and rendered markup. Function replacers are
 * used throughout so "$&", "$'" or "$$" in dictionary text are never read as replacement patterns.
 */
function fillTemplate(head: PageHead, appHtml: string): string {
  const tags = headTags(head, siteUrl, basePath);
  return template
    .replace(/<title>[^<]*<\/title>\s*/, () => '')
    .replace(/<meta\s+name="description"[^>]*>\s*/, () => '')
    .replace('</head>', () => `    ${tags}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${appHtml}</div>`);
}

// GitHub Pages serves 404.html for unknown paths. It must be the empty shell (no prerendered
// markup), so the client renders the not-found route instead of hydrating mismatched HTML.
writeFileSync(join(dist, '404.html'), fillTemplate(notFoundHead(), ''));

const started = Date.now();
for (const page of pages) {
  const html = fillTemplate(page, server.renderPath(page.path, data));
  const file = outputFile(page.path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  // /browse also has a directory of letter pages; a directory index avoids a Pages redirect to /browse/.
  if (page.path === '/browse') {
    mkdirSync(join(dist, 'browse'), { recursive: true });
    writeFileSync(join(dist, 'browse', 'index.html'), html);
  }
}
console.log(`prerender: ${pages.length} pages in ${((Date.now() - started) / 1000).toFixed(1)}s`);

// 4. sitemap.xml, robots.txt, llms.txt
const today = new Date().toISOString().slice(0, 10);
const urls = pages
  .filter((p) => !p.noindex)
  .map((p) => `  <url><loc>${siteUrl}${p.path}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n');
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n# Raw data and HTML fragments are not pages; fetch them directly instead.\nDisallow: ${basePath}data/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

const withEnglish = entries.filter((e) => e.senses.some((s) => s.en)).length;
writeFileSync(
  join(dist, 'llms.txt'),
  `# Abruzzese di paese

> An open-source, searchable dictionary and archive of the Abruzzese dialect (Abruzzo, Italy) with Italian and English meanings. ${entries.length} entries imported from the Treppecore archive on abruzzo.fm, reproduced with attribution. Data licence: CC BY-SA 4.0. Code licence: MIT.

Every entry page is static HTML with a Schema.org DefinedTerm in JSON-LD. English glosses with enTranslateStatus "machine" were machine-translated and not yet reviewed (${withEnglish} of ${entries.length} entries have English).

## Data

- [Full dictionary as JSON](${siteUrl}/data/dictionary.json): array of entries with id, headword, variants, article, senses (it, en, enTranslateStatus), examples, grammarNotes, tags, source (letter, url)
- [Grammar of the dialect (HTML fragment)](${siteUrl}/data/grammar.html)
- [Sitemap](${siteUrl}/sitemap.xml)

## Pages

- [Search](${siteUrl}/): query parameter q, direction parameter dir (abr-it, it-abr, en, any)
- [Browse by letter](${siteUrl}/browse)
- [Entry pages](${siteUrl}/word/a-ardeca): /word/<id>, id is "<letter>-<slug>"
- [Grammar rules](${siteUrl}/grammar)
- [About](${siteUrl}/about)

## Source and reuse

- Source archive: https://www.abruzzo.fm/archivio/treppecore/treppecore.html
- Cite as: Abruzzese di paese, data from the Treppecore archive (abruzzo.fm), CC BY-SA 4.0.
`,
);

rmSync(serverDir, { recursive: true, force: true });
console.log('prerender: wrote 404.html, sitemap.xml, robots.txt, llms.txt');
if (basePath !== '/') {
  console.warn(
    `prerender: note: the site is served under ${basePath}. Crawlers read robots.txt and agents look ` +
      'for llms.txt only at the domain root, so those two files are informational here. Submit ' +
      `${siteUrl}/sitemap.xml to search consoles directly, or deploy to a user site or custom domain.`,
  );
}
