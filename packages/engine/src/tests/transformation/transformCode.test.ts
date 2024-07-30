import * as parser from 'recast/parsers/babel-ts.js';

import { transformCode } from 'src/transformation';

describe('transformCode', () => {
  test('trivial case', () => {
    transformCode({
      script: `print('Hello world!')`,
      code: `anyCode();`,
      globalContext: {},
      parser
    });
  });
});
