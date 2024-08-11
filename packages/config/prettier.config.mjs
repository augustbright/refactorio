/** @type import('prettier').Config */
export default {
  overrides: [
    {
      files: ['**/*'],
      excludeFiles: ['**/*.d.ts', 'setupTests.ts'],
      options: {
        plugins: ['@trivago/prettier-plugin-sort-imports'],
        importOrder: ['^@', '<THIRD_PARTY_MODULES>', '^[./]', '^src/'],
        importOrderSeparation: true,
        importOrderSortSpecifiers: true
      }
    }
  ],
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: 'auto',
  singleAttributePerLine: true,
  trailingComma: 'none',
  singleQuote: true,
  jsxSingleQuote: true
};
