import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { formatEntry, loadEntryFiles } from '../src/node';

let changed = 0;
for (const { path, entry } of loadEntryFiles(
  fileURLToPath(new URL('../entries', import.meta.url)),
)) {
  const next = formatEntry(entry);
  if (readFileSync(path, 'utf8') !== next) {
    writeFileSync(path, next);
    changed += 1;
  }
}
console.log(`data:format rewrote ${changed} file(s).`);
