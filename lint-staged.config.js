/** Runs on staged files before each commit (see .husky/pre-commit). */
export default {
  '*.{js,jsx,mjs,cjs,ts,tsx}': [
    'eslint --fix --no-warn-ignored',
    'prettier --write --ignore-unknown',
  ],
  '*.{json,md,css,html,yml,yaml}': 'prettier --write --ignore-unknown',
  // Validation checks every entry (cross-references included), so run it once without file paths.
  'packages/data/entries/**': () => 'pnpm data:validate',
};
