// Writes batches of Italian glosses and examples that have no English yet, for a one-time
// translation pass. Usage: tsx scripts/export-untranslated.ts <outDir> [batchSize]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEntryFiles } from '../src/node';

export interface BatchItem {
  id: string;
  headword: string;
  senses: string[];
  examples: string[];
}

const outDir = process.argv[2];
const batchSize = Number(process.argv[3] ?? 250);
if (!outDir) {
  console.error('Usage: tsx scripts/export-untranslated.ts <outDir> [batchSize]');
  process.exit(1);
}

const files = loadEntryFiles(fileURLToPath(new URL('../entries', import.meta.url)));
const items: BatchItem[] = [];
for (const { entry } of files) {
  const senses = entry.senses.filter((s) => !s.en).map((s) => s.it);
  const examples = (entry.examples ?? []).filter((x) => x.it && !x.en).map((x) => x.it as string);
  if (senses.length === 0 && examples.length === 0) continue;
  items.push({ id: entry.id, headword: entry.headword, senses, examples });
}

mkdirSync(outDir, { recursive: true });
let n = 0;
for (let i = 0; i < items.length; i += batchSize) {
  n += 1;
  writeFileSync(
    join(outDir, `batch-${String(n).padStart(2, '0')}.json`),
    JSON.stringify(items.slice(i, i + batchSize), null, 1),
  );
}
console.log(
  `entries needing English: ${items.length}; senses: ${items.reduce((a, b) => a + b.senses.length, 0)}; examples: ${items.reduce((a, b) => a + b.examples.length, 0)}; batches: ${n}`,
);
