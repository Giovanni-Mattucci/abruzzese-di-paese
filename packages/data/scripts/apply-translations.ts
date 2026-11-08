// Applies English translations produced by the one-time machine pass.
// Usage: tsx scripts/apply-translations.ts <dir-with-batch-NN.en.json> [--status machine|reviewed]
// Reads every *.en.json file in the directory, merges them into translations/en-auto.json
// (the audit trail committed with the data), then writes senses[].en / examples[].en into the
// entry files, only where English is still missing. Existing English is never overwritten.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatEntry, loadEntryFiles, type TranslateStatus } from '../src/node';

interface Translated {
  id: string;
  senses: string[];
  examples: string[];
}

const dir = process.argv[2];
const status: TranslateStatus = process.argv.includes('--status')
  ? (process.argv[process.argv.indexOf('--status') + 1] as TranslateStatus)
  : 'machine';
if (!dir) {
  console.error('Usage: tsx scripts/apply-translations.ts <dir> [--status machine|reviewed]');
  process.exit(1);
}

const byId = new Map<string, Translated>();
for (const name of readdirSync(dir)
  .filter((n) => n.endsWith('.en.json'))
  .sort()) {
  const items = JSON.parse(readFileSync(join(dir, name), 'utf8')) as Translated[];
  for (const item of items) byId.set(item.id, item);
}

const auditPath = fileURLToPath(new URL('../translations/en-auto.json', import.meta.url));
const audit = {
  generatedAt: new Date().toISOString().slice(0, 10),
  method: 'Claude, one-time pass, reviewed by nobody yet',
  items: [...byId.values()],
};
writeFileSync(auditPath, `${JSON.stringify(audit, null, 1)}\n`);

let entriesChanged = 0;
let sensesFilled = 0;
let examplesFilled = 0;
const problems: string[] = [];
for (const { path, entry } of loadEntryFiles(
  fileURLToPath(new URL('../entries', import.meta.url)),
)) {
  const t = byId.get(entry.id);
  if (!t) continue;
  const pendingSenses = entry.senses.filter((s) => !s.en);
  const pendingExamples = (entry.examples ?? []).filter((x) => x.it && !x.en);
  if (pendingSenses.length !== t.senses.length || pendingExamples.length !== t.examples.length) {
    problems.push(
      `${entry.id}: expected ${pendingSenses.length}/${pendingExamples.length}, got ${t.senses.length}/${t.examples.length}`,
    );
    continue;
  }
  let changed = false;
  pendingSenses.forEach((s, i) => {
    const en = t.senses[i]?.trim();
    if (en && en !== s.it) {
      s.en = en;
      s.enTranslateStatus = status;
      sensesFilled += 1;
      changed = true;
    }
  });
  pendingExamples.forEach((x, i) => {
    const en = t.examples[i]?.trim();
    if (en && en !== x.it) {
      x.en = en;
      x.enTranslateStatus = status;
      examplesFilled += 1;
      changed = true;
    }
  });
  if (changed) {
    writeFileSync(path, formatEntry(entry));
    entriesChanged += 1;
  }
}
for (const p of problems) console.error(`length mismatch: ${p}`);
console.log(
  `translations: ${byId.size} items; entries changed ${entriesChanged}; senses ${sensesFilled}; examples ${examplesFilled}; mismatches ${problems.length}`,
);
if (problems.length > 0) process.exit(1);
