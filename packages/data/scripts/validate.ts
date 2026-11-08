import { fileURLToPath } from 'node:url';
import { loadEntryFiles, validateEntryFiles } from '../src/node';

const root = fileURLToPath(new URL('..', import.meta.url));
const files = loadEntryFiles(fileURLToPath(new URL('../entries', import.meta.url)));
const errors = validateEntryFiles(files, root);

if (errors.length > 0) {
  for (const e of errors) console.error(`${e.path}: ${e.message}`);
  console.error(`\n${errors.length} error(s) in ${files.length} entries.`);
  process.exit(1);
}
console.log(`data:validate ok, ${files.length} entries.`);
