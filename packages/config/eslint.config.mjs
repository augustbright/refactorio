/** ================================================================================================== **
 ** REFACTORIO                                                                                         **
 **  @Author Valerii Bubenshchikov, 2024                                                               **
 **  @License MIT                                                                                      **
 **  @Description This file is part of the Refactorio project, a tool for automatic code refactoring.  **
 ** ================================================================================================== */
import pluginJs from '@eslint/js';

import jestExtended from 'eslint-plugin-jest-extended';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

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
  ...tseslint.configs.recommended,
  //eslintPluginPrettierRecommended,
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
