import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  exportEntries,
  loadEntryFiles,
  renderGrammar,
  validateEntryFiles,
  type SourceFragment,
} from '../src/node';

// Usage: tsx scripts/build.ts [outDir]. The package does not know who consumes it: the caller
// names the directory (the repository's data:build script passes the web app's public/data), and
// the default is this package's own dist/.
const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = resolve(process.argv[2] ?? join(root, 'dist'));
// dictionary.json has two readers. The web app fetches it to build its lookup tables and search
// index, and it is the published dataset for machine readers: llms.txt, the JSON-LD DataDownload
// and the rel="alternate" link all point AI agents and crawlers at /data/dictionary.json.
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
  exportEntries(
    files.map((f) => f.entry),
    fragments,
  ),
);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'dictionary.json'), json);
console.log(
  `data:build wrote ${join(outDir, 'dictionary.json')} (${(json.length / 1024).toFixed(1)} KB)`,
);

// Grammar page: Markdown -> HTML fragment served as a static asset.
const html = renderGrammar(readFileSync(new URL('../grammar/regole.md', import.meta.url), 'utf8'));
writeFileSync(join(outDir, 'grammar.html'), html);
console.log(
  `data:build wrote ${join(outDir, 'grammar.html')} (${(html.length / 1024).toFixed(1)} KB)`,
);
