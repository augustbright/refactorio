/** @type import('prettier').Config */
export default {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: 'auto',
  singleAttributePerLine: true,
  trailingComma: 'none',
  singleQuote: true,
  jsxSingleQuote: true,
  importOrder: ['^@', '<THIRD_PARTY_MODULES>', '^[./]', '^src/'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
};
