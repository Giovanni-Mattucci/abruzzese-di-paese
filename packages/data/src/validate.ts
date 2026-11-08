import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import schema from '../schema/entry.schema.json' with { type: 'json' };
import type { Entry } from './types';

export interface EntryFile {
  path: string;
  entry: Entry;
}

export interface ValidationError {
  path: string;
  message: string;
}

const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const validateSchema = ajv.compile<Entry>(schema);

/** Read every entries/{letter}/{id}.json file under `dir`. Throws on malformed JSON. */
export function loadEntryFiles(dir: string): EntryFile[] {
  const files: EntryFile[] = [];
  for (const letter of readdirSync(dir).sort()) {
    const letterDir = join(dir, letter);
    if (!statSync(letterDir).isDirectory()) continue;
    for (const name of readdirSync(letterDir).sort()) {
      if (!name.endsWith('.json')) continue;
      const path = join(letterDir, name);
      files.push({ path, entry: JSON.parse(readFileSync(path, 'utf8')) as Entry });
    }
  }
  return files;
}

/** Schema plus cross-file rules. Returns an empty array when everything is valid. */
export function validateEntryFiles(files: EntryFile[], root = process.cwd()): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Map<string, string>();
  const seenHashes = new Map<string, string>();

  for (const { path, entry } of files) {
    const rel = relative(root, path);
    const fail = (message: string) => errors.push({ path: rel, message });

    if (!validateSchema(entry)) {
      for (const e of validateSchema.errors ?? []) {
        fail(`${e.instancePath || '/'} ${e.message ?? 'invalid'}`);
      }
      continue;
    }

    if (basename(path, '.json') !== entry.id) fail(`file name must equal id "${entry.id}"`);
    if (basename(dirname(path)) !== entry.source.letter)
      fail(`directory must equal source.letter "${entry.source.letter}"`);
    if (!entry.id.startsWith(`${entry.source.letter}-`))
      fail(`id must start with "${entry.source.letter}-"`);

    const needsReview = entry.tags?.includes('needs-review') ?? false;
    if (entry.senses.length === 0 && !needsReview)
      fail('at least one Italian sense is required unless tagged needs-review');

    const dupId = seenIds.get(entry.id);
    if (dupId) fail(`duplicate id, also in ${dupId}`);
    seenIds.set(entry.id, rel);

    const dupHash = seenHashes.get(entry.source.rawHash);
    if (dupHash) fail(`duplicate source.rawHash, also in ${dupHash}`);
    seenHashes.set(entry.source.rawHash, rel);
  }
  return errors;
}

/** Canonical JSON text for an entry file: stable key order, two-space indent, trailing newline. */
export function formatEntry(entry: Entry): string {
  const order: (keyof Entry)[] = [
    'id',
    'headword',
    'variants',
    'article',
    'pos',
    'pronunciation',
    'locality',
    'senses',
    'examples',
    'etymology',
    'grammarNotes',
    'notes',
    'tags',
    'source',
    'contributors',
    'schemaVersion',
  ];
  const sorted: Record<string, unknown> = {};
  for (const key of order) if (entry[key] !== undefined) sorted[key] = entry[key];
  return `${JSON.stringify(sorted, null, 2)}\n`;
}
