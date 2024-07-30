import pluginJs from '@eslint/js';

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type import("@types/eslint").Linter.Config[] */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    excludedFiles: ['/out/**/*']
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended
];
