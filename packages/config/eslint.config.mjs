import pluginJs from '@eslint/js';

import jestExtended from 'eslint-plugin-jest-extended';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

import disclaimer from './disclaimer.mjs';
import local from './eslint-local/index.mjs';

/** @type import('eslint').Linter.Config[] */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,json}']
  },
  { languageOptions: { globals: globals.node } },
  {
    plugins: {
      local: local
    },
    rules: {
      'local/require-disclaimer': [
        'off',
        {
          boundary:
            '==================================================================================================',
          disclaimer
        }
      ]
    }
  },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'unused-imports': unusedImports
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ]
    }
  },
  jestExtended.configs['flat/all'],

  {
    ignores: ['**/mock-repo/**/*', '**/dist/**/*']
  },
  {
    rules: {
      'no-console': 'error'
    }
  }
];
