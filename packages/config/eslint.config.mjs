import pluginJs from '@eslint/js';

import jestExtended from 'eslint-plugin-jest-extended';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
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
  {
    plugins: { local },
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

  // Typed linting
  ...tsEslint.configs.recommendedTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        project: ['../*/tsconfig.json']
      }
    }
  },
  {
    files: [
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
      '**/*.json',
      '*',
      '**/*.test.ts',
      'eslint-local/**/*'
    ],
    ...tsEslint.configs.disableTypeChecked
  },

  eslintPluginPrettierRecommended,
  {
    plugins: {
      'unused-imports': unusedImports
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
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
  sonarjs.configs.recommended,
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
