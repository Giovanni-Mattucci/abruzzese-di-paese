import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  buildDictionary,
  loadEntryFiles,
  renderGrammar,
  validateEntryFiles,
  type SourceFragment,
} from '../src/node';

const root = fileURLToPath(new URL('..', import.meta.url));
// dictionary.json has two readers. The web app fetches it to build its lookup tables and search
// index, and it is the published dataset for machine readers: llms.txt, the JSON-LD DataDownload
// and the rel="alternate" link all point AI agents and crawlers at /data/dictionary.json.
// Served under /data/ so static file names never collide with app routes such as /grammar.
const webPublic = new URL('../../../apps/web/public/data/', import.meta.url);
const files = loadEntryFiles(fileURLToPath(new URL('../entries', import.meta.url)));
const errors = validateEntryFiles(files, root);
if (errors.length > 0) {
  for (const e of errors) console.error(`${e.path}: ${e.message}`);
  process.exit(1);
}

// Text fragments that point each source link at the entry's own line on the Treppecore page.
const { fragments } = JSON.parse(
  readFileSync(new URL('../source-fragments.json', import.meta.url), 'utf8'),
) as { fragments: Record<string, SourceFragment> };
const json = JSON.stringify(
  buildDictionary(
    files.map((f) => f.entry),
    fragments,
  ),
);
const targets = [
  new URL('../dist/dictionary.json', import.meta.url),
  new URL('dictionary.json', webPublic),
];
for (const target of targets) {
  mkdirSync(new URL('.', target), { recursive: true });
  writeFileSync(target, json);
  console.log(`data:build wrote ${fileURLToPath(target)} (${(json.length / 1024).toFixed(1)} KB)`);
}

// Grammar page: Markdown -> HTML fragment served as a static asset.
const html = renderGrammar(readFileSync(new URL('../grammar/regole.md', import.meta.url), 'utf8'));
writeFileSync(new URL('grammar.html', webPublic), html);
console.log(`data:build wrote data/grammar.html (${(html.length / 1024).toFixed(1)} KB)`);
