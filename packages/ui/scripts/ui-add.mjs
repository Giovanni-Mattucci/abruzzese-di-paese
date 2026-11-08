// Wrapper around the shadcn CLI. The CLI writes flat files into src/base (the "ui" alias in
// components.json); this script guards and repairs that output for this monorepo:
//   - a component that already exists in src/base is refused unless --force is given, because
//     the CLI would replace the repo's edits to it (Button carries the editorial variants)
//   - each generated src/base/<name>.tsx moves to src/base/<name>/<name>.tsx; without --force,
//     a dependency the CLI pulled in that already exists keeps the repo's version
//   - "@/..." alias imports and the bare "cn" import become relative paths
//   - a stray "cn" npm dependency the CLI may add is removed
//   - generated files are formatted with Prettier
// Hand-written components live in src/components, which this script never touches.
// Usage: pnpm ui:add button [card ...] [--force]   or   pnpm ui:add https://<registry>/r/button.json
import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const args = argv.filter((arg) => arg !== '--force');
if (args.length === 0) {
  console.error('Usage: pnpm ui:add <component|registry-url> [...] [--force]');
  process.exit(1);
}

const pkgDir = fileURLToPath(new URL('..', import.meta.url));
const baseDir = join(pkgDir, 'src', 'base');
const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd: pkgDir });

// "button" or "https://<registry>/r/button.json" -> "button"
const componentName = (arg) =>
  arg
    .split(/[/\\]/)
    .pop()
    .replace(/\.json$/, '');
const fileFor = (name) => join(baseDir, name, `${name}.tsx`);

const existing = args.map(componentName).filter((name) => existsSync(fileFor(name)));
if (existing.length > 0 && !force) {
  console.error(
    `Already in src/base: ${existing.join(', ')}. Re-adding replaces the repo's edits to it.\n` +
      'Run again with --force to overwrite, then restore the edits from `git diff`.',
  );
  process.exit(1);
}

run(`pnpm dlx shadcn@4.23.0 add --yes --overwrite ${args.join(' ')}`);

const touched = [];
for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
  // Component folders are already in place; only loose files are new CLI output.
  if (!entry.isFile() || !entry.name.endsWith('.tsx')) continue;
  const name = entry.name.slice(0, -'.tsx'.length);
  const generated = join(baseDir, entry.name);
  const file = fileFor(name);
  if (existsSync(file) && !force) {
    rmSync(generated);
    console.warn(`Kept the existing src/base/${name}/${name}.tsx (pulled in as a dependency).`);
    continue;
  }
  mkdirSync(join(baseDir, name), { recursive: true });
  renameSync(generated, file);

  const before = readFileSync(file, 'utf8');
  const after = before
    .replace(/from ['"](?:@\/lib\/utils|cn)['"]/g, "from '../../lib/utils'")
    .replace(/from ['"]@\/(?:base|components\/ui)\/([^'"/]+)['"]/g, "from '../$1/$1'")
    .replace(/from ['"]@\/hooks\/([^'"]+)['"]/g, "from '../../hooks/$1'")
    .replace(/\btext-white\b/g, 'text-destructive-foreground');
  if (after !== before) writeFileSync(file, after);
  touched.push(file);
}

const pkgPath = join(pkgDir, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
if (pkg.dependencies?.cn) {
  delete pkg.dependencies.cn;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  run('pnpm install');
}

if (touched.length > 0)
  run(`pnpm exec prettier --write ${touched.map((f) => JSON.stringify(f)).join(' ')}`);
console.log(
  force
    ? 'ui:add done. Review `git diff src/base` and restore any repo edits the overwrite removed.'
    : 'ui:add done. Export new components from src/index.ts (./base/<name>/<name>) and list them in registry.json.',
);
