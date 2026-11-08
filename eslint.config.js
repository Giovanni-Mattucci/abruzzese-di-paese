import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import i18next from 'eslint-plugin-i18next';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      'packages/data/entries/**',
      'apps/web/public/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  {
    files: ['**/*.tsx'],
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ['**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: ['apps/web/src/**/*.tsx'],
    ...reactRefresh.configs.vite,
  },
  {
    // Every user-facing string goes through i18next.
    files: ['apps/web/src/**/*.tsx'],
    ignores: ['apps/web/src/**/*.test.tsx', 'apps/web/src/test/**'],
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': ['error', { mode: 'jsx-text-only' }],
    },
  },
  {
    // Design-system seam: the app never reaches past @mannaggia/ui's public surface.
    files: ['apps/web/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@radix-ui/*',
                'radix-ui',
                'lucide-react',
                'class-variance-authority',
                'minisearch',
              ],
              message: 'Import UI behaviour through @mannaggia/ui and search through @adp/search.',
            },
            {
              group: ['@mannaggia/ui/*', '!@mannaggia/ui/theme.css', '**/packages/ui/**'],
              message: 'Import only from the @mannaggia/ui public surface.',
            },
          ],
        },
      ],
    },
  },
  {
    // Generated shadcn components must not keep "@/..." aliases; pnpm ui:add rewrites them.
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/*'], message: 'Use relative imports inside @mannaggia/ui.' }] },
      ],
    },
  },
);
