// Performance budget: the main JS entry must stay under the gzip limit.
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const LIMIT_KB = Number(process.env['BUNDLE_LIMIT_KB'] ?? 150);
const dir = new URL('../dist/assets/', import.meta.url);
const entries = readdirSync(dir).filter((f) => /^index-.*\.js$/.test(f));
if (entries.length === 0) {
  console.error('check-bundle-size: no index-*.js in dist/assets; run the build first');
  process.exit(1);
}
let failed = false;
for (const file of entries) {
  const kb = gzipSync(readFileSync(new URL(file, dir))).length / 1024;
  const ok = kb <= LIMIT_KB;
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${file} ${kb.toFixed(1)} KB gzip (limit ${LIMIT_KB} KB)`);
}
process.exit(failed ? 1 : 0);
