import shared from '@refactorio/config/eslint.config.mjs';

/** @type import('eslint').Linter.Config[] */
export default [
  ...shared,
  {
    files: [
      '**/src/evaluation/**/*',
      '**/src/parsing/**/*',
      '**/src/tokens/**/*'
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ThrowStatement',
          message:
            'Throw statements are not allowed. Use "ErrorManager.throw" instead.'
        }
      ]
    }
  }
];
