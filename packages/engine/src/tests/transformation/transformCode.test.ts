import * as parser from 'recast/parsers/babel-ts.js';

import { transformCode } from 'src/transformation';

describe('transformCode', () => {
  test('trivial case', async () => {
    const { result } = transformCode({
      script: `print('Hello world!')`,
      code: `anyCode();`,
      globalContext: {},
      parser
    });

    const { code, isChanged } = await result;

    expect(isChanged).toBe(false);
    expect(code).toBe('anyCode();');
  });
});
