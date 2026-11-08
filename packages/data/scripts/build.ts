import { marked } from 'marked';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildDictionary, loadEntryFiles, validateEntryFiles } from '../src/node';

const root = fileURLToPath(new URL('..', import.meta.url));
// Served under /data/ so static file names never collide with app routes such as /grammar.
const webPublic = new URL('../../../apps/web/public/data/', import.meta.url);
const files = loadEntryFiles(fileURLToPath(new URL('../entries', import.meta.url)));
const errors = validateEntryFiles(files, root);
if (errors.length > 0) {
  for (const e of errors) console.error(`${e.path}: ${e.message}`);
  process.exit(1);
}

const json = JSON.stringify(buildDictionary(files.map((f) => f.entry)));
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
const markdown = readFileSync(new URL('../grammar/regole.md', import.meta.url), 'utf8');
const body = markdown.replace(/^# .*\n+(Source: .*\n+)?/, '');
const html = marked.parse(body, { async: false });
writeFileSync(new URL('grammar.html', webPublic), html);
console.log(`data:build wrote data/grammar.html (${(html.length / 1024).toFixed(1)} KB)`);
